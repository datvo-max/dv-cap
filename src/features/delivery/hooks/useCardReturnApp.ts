// src/hooks/useCardReturnApp.ts
import { useState, useRef, useCallback } from "react";
import { db } from "@/shared/lib/db";
import { Html5Qrcode } from "html5-qrcode";
import { exportReturnExcel } from "@/shared/utils/exportReturnToExcel";

// ==========================================
// 1. IMPORT CÁC MODULE NGHIỆP VỤ ĐÃ TÁCH
// ==========================================
import { useCardManagement } from "./useCardManagement";
import { useCardImport } from "./useCardImport";

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

  // ==========================================
  // 4. CÁC STATE CỐT LÕI CÒN LẠI CỦA GIAO DIỆN
  // ==========================================
  const [scanMode, setScanMode] = useState<'import' | 'return'>('return');
  const [isWebCamActive, setIsWebCamActive] = useState(false);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [scannerDisplayValue, setScannerDisplayValue] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<number | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);
  const returnInputRef = useRef<HTMLInputElement>(null);
  const cameraActionRef = useRef<'import' | 'return'>('return');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isCameraPaused = useRef(false);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, message: "" });
  const [exportModalConfig, setExportModalConfig] = useState<{ isOpen: boolean; type: 'all' | 'returned' | 'pending' | 'selected' | null; }>({ isOpen: false, type: null });

  // MỚI: State chọn thẻ và Shipper
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [assignShipperModalConfig, setAssignShipperModalConfig] = useState({ isOpen: false });

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
      showToast(`🔄 Đã khôi phục thẻ của ${card.fullName} về kho (Hộp ${card.zone})`, "info");
    } catch (error) {
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
      } catch (err) {
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
  // 7. CÁC TIỆN ÍCH HỆ THỐNG (Backup, Export, Xóa kho)
  // ==========================================
  const requestClearData = () => {
    setModalConfig({
      isOpen: true,
      message: "Hành động này sẽ xóa sạch toàn bộ dữ liệu trong Kho thẻ (IndexedDB) và không thể khôi phục!"
    });
  };
  const closeModal = () => setModalConfig({ isOpen: false, message: "" });
  const confirmClearData = async () => {
    try {
      await db.cards.clear();
      showToast("🗑️ Đã xóa sạch dữ liệu kho thẻ!", "warning");
    } catch (error) {
      showToast("❌ Có lỗi xảy ra khi xóa dữ liệu!", "error");
    } finally {
      setModalConfig({ isOpen: false, message: "" });
    }
  };

  // 6. Back up database
  const handleBackupDatabase = async () => {
    try {
      await import('dexie-export-import');
      showToast("Đang tạo file sao lưu hệ thống...", "info");

      // 1. Nén toàn bộ DB thành file JSON (định dạng Blob)
      const blob = await db.export();

      // 2. Tạo đường link ảo để ép trình duyệt tải file xuống
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `KhoThe_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();

      URL.revokeObjectURL(url); // Dọn dẹp bộ nhớ
      showToast("✅ Đã xuất file sao lưu dữ liệu thành công!", "success");
    } catch (error) {
      console.error("Lỗi backup:", error);
      showToast("❌ Có lỗi xảy ra khi sao lưu dữ liệu!", "error");
    }
  };
  const handleRestoreDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await import('dexie-export-import');
      showToast("Đang khôi phục hệ thống...", "warning");

      // Đọc và nạp dữ liệu từ file JSON vào hệ thống Dexie
      await db.import(file, {
        // Tùy chọn này rất quan trọng: Xoá sạch dữ liệu kho thẻ cũ (nếu có) trên máy mới trước khi đè dữ liệu này vào để đảm bảo tính đồng bộ 100% với máy A.
        clearTablesBeforeImport: true,
      });

      showToast("✅ Đã khôi phục toàn bộ kho thẻ thành công!", "success");
      e.target.value = ""; // Reset lại input để có thể chọn lại đúng file đó lần sau
    } catch (error) {
      console.error("Lỗi restore:", error);
      showToast("❌ Lỗi khi đọc file sao lưu. Vui lòng kiểm tra lại!", "error");
    }
  };
  const openExportModal = (type: 'all' | 'returned' | 'pending' | 'selected') => { setExportModalConfig({ isOpen: true, type }); };
  const closeExportModal = () => setExportModalConfig({ isOpen: false, type: null });
  // Hàm thực thi sau khi đã chọn xong cột
  const executeExportExcel = async (selectedKeys: string[], type: 'all' | 'returned' | 'pending' | 'selected') => {
    try {
      closeExportModal(); // Đóng modal ngay khi bấm
      setIsExporting(true);
      setExportProgress(0);

      let dataToExport = [];
      if (type === 'all') {
        dataToExport = await db.cards.toArray();
      } else if (type === 'selected') {
        const idsArray = Array.from(selectedIds);
        dataToExport = await db.cards.where('id').anyOf(idsArray).toArray();
      } else {
        dataToExport = await db.cards.where('status').equals(type).toArray();
      }

      if (dataToExport.length === 0) {
        showToast("⚠️ Không có dữ liệu để xuất!", "warning");
        setIsExporting(false);
        setExportProgress(null);
        return;
      }

      // Đẩy selectedKeys vào hàm xuất chuẩn
      await exportReturnExcel(dataToExport, type, selectedKeys, (percent) => {
        setExportProgress(percent);
      });

      const typeName = type === 'all' ? 'Toàn bộ kho' : (type === 'returned' ? 'Đã trả' : (type === 'selected' ? 'Đã chọn' : 'Còn lại'));
      showToast(`✅ Đã tải xuống file: ${typeName}`, "success");

    } catch (error) {
      console.error("Export Error:", error);
      showToast("❌ Có lỗi xảy ra khi xuất file!", "error");
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(null);
      }, 1000);
    }
  };

  // MỚI: Các hàm xử lý chọn thẻ và Shipper
  const toggleSelectCard = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((displayedIds: number[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allDisplayedSelected = displayedIds.every(id => next.has(id));
      if (allDisplayedSelected) {
        displayedIds.forEach(id => next.delete(id));
      } else {
        displayedIds.forEach(id => next.add(id));
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const openAssignShipperModal = () => {
    if (selectedIds.size === 0) {
      showToast("⚠️ Vui lòng chọn ít nhất 1 thẻ để bàn giao shipper!", "warning");
      return;
    }
    setAssignShipperModalConfig({ isOpen: true });
  };

  const closeAssignShipperModal = () => {
    setAssignShipperModalConfig({ isOpen: false });
  };

  const executeAssignShipper = async (name: string, phone: string) => {
    try {
      if (selectedIds.size === 0) return;
      const idsArray = Array.from(selectedIds);
      
      let count = 0;
      await db.transaction("rw", db.cards, async () => {
        for (const id of idsArray) {
          const card = await db.cards.get(id);
          if (card && card.status !== 'returned') {
            await db.cards.update(id, {
              status: 'shipping',
              shipperName: name,
              shipperPhone: phone,
              shippedAt: Date.now()
            });
            count++;
          }
        }
      });
      
      showToast(`✅ Đã bàn giao thành công ${count} thẻ cho shipper ${name}!`, "success");
      clearSelection();
      closeAssignShipperModal();
    } catch (error) {
      console.error(error);
      showToast("❌ Có lỗi xảy ra khi bàn giao cho shipper!", "error");
    }
  };

  const executeBulkConfirmDelivered = async () => {
    try {
      if (selectedIds.size === 0) return;
      const idsArray = Array.from(selectedIds);
      
      let count = 0;
      await db.transaction("rw", db.cards, async () => {
        for (const id of idsArray) {
          const card = await db.cards.get(id);
          if (card && card.status === 'shipping') {
            await db.cards.update(id, {
              status: 'returned',
              returnedAt: Date.now()
            });
            count++;
          }
        }
      });
      
      showToast(`✅ Đã xác nhận shipper giao thành công ${count} thẻ!`, "success");
      clearSelection();
    } catch (error) {
      console.error(error);
      showToast("❌ Có lỗi xảy ra khi xác nhận giao hàng hàng loạt!", "error");
    }
  };

  const executeBulkReturnToWarehouse = async () => {
    try {
      if (selectedIds.size === 0) return;
      const idsArray = Array.from(selectedIds);
      
      let count = 0;
      await db.transaction("rw", db.cards, async () => {
        for (const id of idsArray) {
          const card = await db.cards.get(id);
          if (card && (card.status === 'shipping' || card.status === 'returned')) {
            await db.cards.update(id, {
              status: 'pending',
              returnedAt: undefined,
              shipperName: undefined,
              shipperPhone: undefined,
              shippedAt: undefined
            });
            count++;
          }
        }
      });
      
      showToast(`🔄 Đã hoàn tác ${count} thẻ về lại kho!`, "info");
      clearSelection();
    } catch (error) {
      console.error(error);
      showToast("❌ Có lỗi xảy ra khi hoàn tác hàng loạt!", "error");
    }
  };


  // ==========================================
  // 8. TỔNG HỢP VÀ TRẢ RA GIAO DIỆN (MẶT TIỀN)
  // ==========================================
  return {
    toasts, showToast,

    // Gộp toàn bộ hàm từ các file đã tách ra bằng cú pháp "..."
    ...cardManager,  // Có chứa: editModalConfig, mergeModalConfig, updateCardDetails, ...
    ...cardImporter, // Có chứa: isNoPhotoImport, handleImportExcel, handleForceNextBox, ...

    // Trả ra các Refs
    importInputRef, returnInputRef, cameraActionRef,

    // Trả ra WebCam & Trả thẻ
    isWebCamActive, isFlashActive, scannerDisplayValue, scanMode, setScanMode,
    startWebcam, stopWebcam, handleScannerChange,
    handleReturnScannerInput, processReturnCard, undoReturnCard,

    // Trả ra Backup, Export, Modal
    modalConfig, requestClearData, confirmClearData, closeModal,
    handleBackupDatabase, handleRestoreDatabase,
    exportModalConfig, openExportModal, closeExportModal, executeExportExcel, isExporting, exportProgress,

    // MỚI: Trả ra các biến và hàm phục vụ Chọn hàng loạt & Shipper
    selectedIds, isSelectMode, setIsSelectMode,
    assignShipperModalConfig, openAssignShipperModal, closeAssignShipperModal, executeAssignShipper,
    toggleSelectCard, toggleSelectAll, clearSelection,
    executeBulkConfirmDelivered, executeBulkReturnToWarehouse
  };
}