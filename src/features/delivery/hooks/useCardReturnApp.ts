// src/hooks/useCardReturnApp.ts
import { useState, useRef, useCallback } from "react";
import { db, addCardHistory } from "@/shared/lib/db";
import { Html5Qrcode } from "html5-qrcode";

// ==========================================
// 1. IMPORT CÁC MODULE NGHIỆP VỤ ĐÃ TÁCH
// ==========================================
import { useCardManagement } from "./useCardManagement";
import { useCardImport } from "./useCardImport";
import { useCardSelection } from "./useCardSelection";
import { useSystemUtils } from "./useSystemUtils";

export function useCardReturnApp() {
  // ==========================================
  // 2. QUẢN LÝ TOAST (Truyền xuống cho các module con)
  // ==========================================
  interface ToastItem { id: number; msg: string; type: "success" | "error" | "warning" | "info"; }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((msg: string, type: "success" | "error" | "warning" | "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // ==========================================
  // 3. KHỞI TẠO CÁC MODULE NGHIỆP VỤ
  // ==========================================
  const cardManager = useCardManagement(showToast);
  const cardImporter = useCardImport(showToast);
  const cardSelection = useCardSelection(showToast);
  const systemUtils = useSystemUtils(showToast, cardSelection.selectedIds);

  // ==========================================
  // 4. CÁC STATE CỐT LÕI CÒN LẠI CỦA GIAO DIỆN
  // ==========================================
  const [scanMode, setScanMode] = useState<'import' | 'return'>('return');
  const [isWebCamActive, setIsWebCamActive] = useState(false);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [scannerDisplayValue, setScannerDisplayValue] = useState("");

  const importInputRef = useRef<HTMLInputElement>(null);
  const returnInputRef = useRef<HTMLInputElement>(null);
  const cameraActionRef = useRef<'import' | 'return'>('return');
  const [cameraAction, setCameraAction] = useState<'import' | 'return'>('return');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isCameraPaused = useRef(false);

  // ==========================================
  // 5. NGHIỆP VỤ TRẢ THẺ 
  // ==========================================
  const processReturnCard = async (rawData: string) => {
    let idNumber = rawData;
    if (rawData.includes("|")) {
      const parts = rawData.split("|");
      idNumber = parts[0].length === 12 ? parts[0] : (parts.length > 2 ? parts[2] : rawData);
    }

    const cccdRegex = /^\d{12}$/;
    if (!cccdRegex.test(idNumber)) {
      showToast("❌ Lỗi: Định dạng QR không hợp lệ!", "error");
      return;
    }

    const card = await db.cards.where('idNumber').equals(idNumber).first();

    if (!card) {
      showToast(`❌ Không tìm thấy hồ sơ cho số thẻ: ${idNumber}`, "error");
      return;
    }
    if (card.status === 'returned') {
      showToast(`⚠️ Thẻ của ${card.fullName} đã được trả trước đó rồi!`, "warning");
      return;
    }

    await db.cards.update(card.id!, {
      status: 'returned',
      returnedAt: Date.now()
    });

    await addCardHistory(card.idNumber, 'return', 'Trả thẻ trực tiếp cho công dân');

    showToast(`✅ Đã trả thẻ: ${card.fullName} (Vị trí: Hộp ${card.zone})`, "success");
  };

  const undoReturnCard = async (id: number) => {
    try {
      const card = await db.cards.get(id);
      if (!card) { showToast("❌ Không tìm thấy hồ sơ thẻ này!", "error"); return; }
      if (card.status === 'pending') { showToast("⚠️ Thẻ này vẫn đang ở trong kho mà!", "warning"); return; }

      await db.cards.update(id, { 
        status: 'pending', 
        returnedAt: undefined,
        shipperName: undefined,
        shipperPhone: undefined,
        shippedAt: undefined
      });
      await addCardHistory(card.idNumber, 'undo_return', `Hoàn tác trả thẻ, đưa về kho Hộp ${card.zone}`);
      showToast(`🔄 Đã khôi phục thẻ của ${card.fullName} về kho (Hộp ${card.zone})`, "info");
    } catch {
      showToast("❌ Có lỗi xảy ra khi hoàn tác!", "error");
    }
  };

  const handleReturnScannerInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value) {
      processReturnCard(e.currentTarget.value);
      e.currentTarget.value = "";
    }
  };

  // ==========================================
  // 6. XỬ LÝ CAMERA (Đã được nối dây với cardImporter)
  // ==========================================
  const handleScannerChange = (e: React.ChangeEvent<HTMLInputElement>) => { setScannerDisplayValue(e.target.value); };

  const handleCameraScan = (decodedText: string) => {
    if (isCameraPaused.current) return;
    isCameraPaused.current = true;
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 100);

    if (cameraActionRef.current === 'import') {
      // Gọi hàm Nạp thẻ từ module đã tách (Cực kỳ quan trọng)
      if (cardImporter.processImportCard) {
        cardImporter.processImportCard(decodedText);
      }
    } else {
      processReturnCard(decodedText);
    }
    setTimeout(() => { isCameraPaused.current = false; }, 2000);
  };

  const startWebcam = async (action: 'import' | 'return') => {
    cameraActionRef.current = action;
    setCameraAction(action);
    setIsWebCamActive(true);
    setTimeout(async () => {
      if (!html5QrCodeRef.current) html5QrCodeRef.current = new Html5Qrcode("return-reader");
      try {
        if (!html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            handleCameraScan,
            () => { }
          );
        }
      } catch {
        showToast("Lỗi mở camera!", "error");
      }
    }, 150);
  };

  const stopWebcam = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop();
    }
    setIsWebCamActive(false);
  };

  // ==========================================
  // 8. TỔNG HỢP VÀ TRẢ RA GIAO DIỆN (MẶT TIỀN)
  // ==========================================
  return {
    toasts, showToast,

    // Gộp toàn bộ hàm từ các file đã tách ra bằng cú pháp "..."
    ...cardManager,
    ...cardImporter,
    ...cardSelection,
    ...systemUtils,

    // Trả ra các Refs
    importInputRef, returnInputRef, cameraActionRef,
    cameraAction,

    // Trả ra WebCam & Trả thẻ
    isWebCamActive, isFlashActive, scannerDisplayValue, scanMode, setScanMode,
    startWebcam, stopWebcam, handleScannerChange,
    handleReturnScannerInput, processReturnCard, undoReturnCard
  };
}