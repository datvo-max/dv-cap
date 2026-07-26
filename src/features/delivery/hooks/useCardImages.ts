import { useState, useEffect, useCallback } from "react";
import { db, CardImageRecord } from "@/shared/lib/db";
import { compressImage } from "@/shared/utils/imageUtils";

export type ImageType = "front" | "back" | "citizen" | "other";

interface UseCardImagesReturn {
  images: Record<ImageType, CardImageRecord | null>;
  isUploading: boolean;
  uploadError: string | null;
  addImage: (file: File, imageType: ImageType) => Promise<void>;
  deleteImage: (imageType: ImageType) => Promise<void>;
  downloadImage: (imageType: ImageType, filename?: string) => void;
}

export function useCardImages(
  cardId: number | null,
  isOpen: boolean
): UseCardImagesReturn {
  const emptyImages: Record<ImageType, CardImageRecord | null> = {
    front: null,
    back: null,
    citizen: null,
    other: null,
  };

  const [images, setImages] = useState<Record<ImageType, CardImageRecord | null>>(emptyImages);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Load ảnh khi mở modal
  useEffect(() => {
    if (!isOpen || !cardId) {
      setImages(emptyImages);
      return;
    }

    async function loadImages() {
      if (!cardId) return;
      const records = await db.cardImages
        .where("cardId")
        .equals(cardId)
        .toArray();

      const mapped: Record<ImageType, CardImageRecord | null> = {
        front: null,
        back: null,
        citizen: null,
        other: null,
      };
      for (const rec of records) {
        mapped[rec.imageType] = rec;
      }
      setImages(mapped);
    }

    loadImages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, cardId]);

  const addImage = useCallback(async (file: File, imageType: ImageType) => {
    if (!cardId) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const dataUrl = await compressImage(file, 1200, 900, 0.85);

      // Xóa ảnh cũ cùng loại nếu đã có
      const existing = images[imageType];
      if (existing?.id) {
        await db.cardImages.delete(existing.id);
      }

      const newRecord: CardImageRecord = {
        cardId,
        imageType,
        dataUrl,
        createdAt: Date.now(),
      };

      const id = await db.cardImages.add(newRecord);
      const saved = { ...newRecord, id: id as number };

      setImages((prev) => ({ ...prev, [imageType]: saved }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi không xác định";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  }, [cardId, images]);

  const deleteImage = useCallback(async (imageType: ImageType) => {
    const existing = images[imageType];
    if (!existing?.id) return;
    await db.cardImages.delete(existing.id);
    setImages((prev) => ({ ...prev, [imageType]: null }));
  }, [images]);

  const downloadImage = useCallback((imageType: ImageType, filename?: string) => {
    const rec = images[imageType];
    if (!rec) return;
    const defaultFilenames: Record<ImageType, string> = {
      front: "mat-truoc-the.jpg",
      back: "mat-sau-the.jpg",
      citizen: "anh-cong-dan.jpg",
      other: "anh-khac.jpg",
    };
    const link = document.createElement("a");
    link.href = rec.dataUrl;
    link.download = filename || defaultFilenames[imageType];
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [images]);

  return { images, isUploading, uploadError, addImage, deleteImage, downloadImage };
}

