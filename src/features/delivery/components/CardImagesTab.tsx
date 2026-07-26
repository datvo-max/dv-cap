"use client";
import React, { useRef, useState } from "react";
import { useCardImages, ImageType } from "../hooks/useCardImages";
import { estimateSizeKB } from "@/shared/utils/imageUtils";

interface CardImagesTabProps {
  cardId: number | null;
  isOpen: boolean;
}

interface ImageSlotConfig {
  type: ImageType;
  label: string;
  icon: string;
  color: string;
}

const IMAGE_SLOTS: ImageSlotConfig[] = [
  { type: "front", label: "Mặt trước thẻ", icon: "F", color: "blue" },
  { type: "back", label: "Mặt sau thẻ", icon: "B", color: "indigo" },
  { type: "citizen", label: "Ảnh công dân", icon: "C", color: "emerald" },
  { type: "other", label: "Ảnh khác", icon: "+", color: "gray" },
];

const IMAGE_SLOT_LABELS: Record<ImageType, string> = {
  front: "Mặt trước thẻ",
  back: "Mặt sau thẻ",
  citizen: "Ảnh công dân",
  other: "Ảnh khác",
};

export default function CardImagesTab({ cardId, isOpen }: CardImagesTabProps) {
  const { images, isUploading, uploadError, addImage, deleteImage, downloadImage } =
    useCardImages(cardId, isOpen);

  const fileInputRefs = useRef<Record<ImageType, HTMLInputElement | null>>({
    front: null,
    back: null,
    citizen: null,
    other: null,
  });
  const cameraInputRefs = useRef<Record<ImageType, HTMLInputElement | null>>({
    front: null,
    back: null,
    citizen: null,
    other: null,
  });

  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ImageType | null>(null);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageType: ImageType
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await addImage(file, imageType);
    // Reset input để có thể chọn lại cùng file
    e.target.value = "";
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    await deleteImage(confirmDelete);
    setConfirmDelete(null);
  };

  return (
    <div className="relative">
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-2xl w-full animate-in zoom-in-90 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                <span className="text-white text-xs font-bold">{lightbox.label}</span>
                <button
                  onClick={() => setLightbox(null)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <img
                src={lightbox.src}
                alt={lightbox.label}
                className="w-full object-contain max-h-[70vh]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete popover */}
      {confirmDelete && (
        <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center animate-in fade-in duration-150">
          <div className="bg-white border border-red-200 shadow-xl rounded-xl p-5 text-center max-w-xs">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-800 mb-1">Xóa ảnh này?</p>
            <p className="text-xs text-gray-500 mb-4">
              {IMAGE_SLOT_LABELS[confirmDelete]} sẽ bị xóa vĩnh viễn khỏi IndexedDB.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload error banner */}
      {uploadError && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
          Lỗi: {uploadError}
        </div>
      )}

      {/* Loading overlay */}
      {isUploading && (
        <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 font-medium flex items-center gap-2">
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Đang nén và lưu ảnh...
        </div>
      )}

      {/* Grid 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        {IMAGE_SLOTS.map(({ type, label }) => {
          const record = images[type];
          const sizeKB = record ? estimateSizeKB(record.dataUrl) : 0;

          return (
            <div key={type} className="relative">
              {/* Hidden inputs */}
              <input
                ref={(el) => { fileInputRefs.current[type] = el; }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, type)}
              />
              <input
                ref={(el) => { cameraInputRefs.current[type] = el; }}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileChange(e, type)}
              />

              {record ? (
                /* --- Đã có ảnh --- */
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 shadow-sm group">
                  {/* Thumbnail - click để xem to */}
                  <div
                    className="relative cursor-zoom-in"
                    onClick={() => setLightbox({ src: record.dataUrl, label: label })}
                  >
                    <img
                      src={record.dataUrl}
                      alt={label}
                      className="w-full h-28 object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    {/* Overlay icon phóng to */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="px-2 py-1.5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-700 leading-tight">{label}</p>
                      <p className="text-[9px] text-gray-400">{sizeKB} KB • {new Date(record.createdAt).toLocaleDateString("vi-VN")}</p>
                    </div>
                    <div className="flex gap-1">
                      {/* Tải xuống */}
                      <button
                        title="Tải xuống"
                        onClick={() => downloadImage(type)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      {/* Thay thế ảnh */}
                      <button
                        title="Thay thế ảnh"
                        onClick={() => fileInputRefs.current[type]?.click()}
                        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors rounded"
                        disabled={isUploading}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      {/* Xóa */}
                      <button
                        title="Xóa ảnh"
                        onClick={() => setConfirmDelete(type)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors rounded"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* --- Chưa có ảnh --- */
                <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 h-full min-h-[9rem] flex flex-col items-center justify-center gap-2 p-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-200 group">
                  <div className="w-8 h-8 bg-gray-100 group-hover:bg-indigo-100 rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-bold text-gray-600 text-center leading-tight">{label}</p>
                  <p className="text-[9px] text-gray-400 text-center">Chưa có ảnh</p>
                  <div className="flex gap-1.5 mt-1">
                    {/* Chọn file */}
                    <button
                      onClick={() => fileInputRefs.current[type]?.click()}
                      disabled={isUploading}
                      className="px-2.5 py-1.5 bg-white border border-gray-300 text-[10px] font-bold text-gray-600 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Chọn file
                    </button>
                    {/* Chụp camera (chỉ hiện trên mobile) */}
                    <button
                      onClick={() => cameraInputRefs.current[type]?.click()}
                      disabled={isUploading}
                      className="sm:hidden px-2.5 py-1.5 bg-white border border-gray-300 text-[10px] font-bold text-gray-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Chụp
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[10px] text-gray-400 text-center">
        Ảnh được nén và lưu trên thiết bị. Tối đa 1 ảnh mỗi loại. Dung lượng xấp xỉ 120-220 KB/ảnh.
      </p>
    </div>
  );
}
