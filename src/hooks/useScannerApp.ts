// src/hooks/useScannerApp.ts
import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CCCDRecord } from "@/types/cccd";
import { parseCCCD } from "@/utils/cccdParser";
import { exportToExcel } from "@/utils/exportToExcel";
import { db, ScannedRecord } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export function useScannerApp() {
  // Thay thế LocalStorage bằng useLiveQuery của Dexie.
  // Giao diện sẽ TỰ ĐỘNG cập nhật (re-render) bất cứ khi nào bảng scannedCards có thay đổi.
  // 'asc' = Mới xếp sau (Mặc định), 'desc' = Mới xếp đầu
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Gắn sortOrder vào mảng dependency để Dexie tự động truy vấn lại khi đổi chế độ
  const rawData = useLiveQuery(
    () => {
      const query = db.scannedCards.orderBy('id');
      return sortOrder === 'desc' ? query.reverse().toArray() : query.toArray();
    },
    [sortOrder]
  );

  // Đảm bảo data luôn là mảng, kể cả khi IndexedDB đang tải
  const data = rawData || [];

  const [isWebCamActive, setIsWebCamActive] = useState(false);
  const [isDeviceScannerActive, setIsDeviceScannerActive] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, message: "" });
  const [scannerDisplayValue, setScannerDisplayValue] = useState("");
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const isCameraPaused = useRef(false);
  const scannerInputRef = useRef<HTMLInputElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  interface ToastItem {
    id: number;
    msg: string;
    type: "success" | "error" | "warning" | "info";
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((msg: string, type: "success" | "error" | "warning" | "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // ==========================================
  // XỬ LÝ QUÉT VÀ LƯU VÀO INDEXEDDB
  // ==========================================
  const handleScanSuccess = async (decodedText: string) => {
    const record = parseCCCD(decodedText);

    if (!record.idNumber) {
      showToast(`❌ Lỗi: Mã QR không hợp lệ!`, "error");
      return;
    }

    try {
      // 1. Kiểm tra trùng lặp trực tiếp từ Database
      const existingCount = await db.scannedCards.where('idNumber').equals(record.idNumber).count();

      if (existingCount > 0) {
        showToast(`⚠️ Thông tin ${record.fullName} đã tồn tại`, "warning");
        return;
      }

      // 2. Thêm vào Database
      const { id, ...recordData } = record;
      await db.scannedCards.add({
        ...recordData,
        scannedAt: new Date().toLocaleString('vi-VN') // Lưu dấu thời gian quét
      });

      showToast(`✅ Đã thêm: ${record.fullName}`, "success");
    } catch (error) {
      console.error("Lỗi ghi IndexedDB:", error);
      showToast("❌ Không thể lưu vào cơ sở dữ liệu!", "error");
    }
  };

  const handleCameraScan = (decodedText: string) => {
    if (isCameraPaused.current) return;
    isCameraPaused.current = true;
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 100);

    handleScanSuccess(decodedText);

    setTimeout(() => {
      isCameraPaused.current = false;
    }, 2000);
  };

  const startWebcam = async () => {
    setIsWebCamActive(true);
    setTimeout(async () => {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("reader");
      }
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
        console.warn("Lỗi phần cứng camera:", err);
        showToast("Lỗi mở camera! Vui lòng thử lại hoặc kiểm tra quyền truy cập.", "error");
      }
    }, 150);
  };

  const stopWebcam = async () => {
    if (html5QrCodeRef.current?.isScanning) await html5QrCodeRef.current.stop();
    setIsWebCamActive(false);
  };

  // ==========================================
  // XỬ LÝ ĐỌC FILE ẢNH VÀO INDEXEDDB
  // ==========================================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    showToast("Đang phân tích ảnh...", "warning");
    const fileScanner = new Html5Qrcode("file-scanner");
    let failCount = 0;
    // Use a loose type here because parsed records may include id as string
    // while the ScannedRecord type expects a numeric id (auto-generated by IndexedDB).
    const newRecords: any[] = [];
    const duplicateNames: string[] = [];

    // Lấy trước toàn bộ ID đang có trong DB để đối chiếu cho nhanh
    const existingIds = new Set((await db.scannedCards.toArray()).map(c => c.idNumber));

    for (let i = 0; i < files.length; i++) {
      try {
        const text = await fileScanner.scanFile(files[i], false);
        const record = parseCCCD(text);

        if (record.idNumber) {
          const isAlreadyExists = existingIds.has(record.idNumber) || newRecords.some(r => r.idNumber === record.idNumber);

          if (isAlreadyExists) {
            duplicateNames.push(record.fullName);
          } else {
            newRecords.push({
              ...record,
              scannedAt: new Date().toLocaleString('vi-VN')
            });
          }
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
      }
    }

    if (newRecords.length > 0) {
      // Ghi hàng loạt (Bulk Insert) vào IndexedDB rất nhanh
      await db.scannedCards.bulkAdd(newRecords);

      const namesList = newRecords.map(record => record.fullName);
      let successMessage = namesList.length <= 3
        ? `✅ Đã thêm: ${namesList.join(", ")}`
        : `✅ Đã thêm: ${namesList.slice(0, 3).join(", ")} và ${namesList.length - 3} người khác.`;

      showToast(successMessage, "success");
    }

    if (duplicateNames.length > 0) {
      setTimeout(() => {
        if (duplicateNames.length <= 2) {
          duplicateNames.forEach(name => showToast(`⚠️ Thông tin ${name} đã tồn tại`, "warning"));
        } else {
          showToast(`⚠️ Có ${duplicateNames.length} hồ sơ bị trùng lặp.`, "warning");
        }
      }, newRecords.length > 0 ? 1500 : 0);
    }

    if (failCount > 0) {
      setTimeout(() => {
        showToast(`❌ Có ${failCount} ảnh bị mờ không nhận diện được.`, "error");
      }, (newRecords.length > 0 || duplicateNames.length > 0) ? 3000 : 0);
    }

    e.target.value = "";
  };


  useEffect(() => {
    const handleGlobalClick = () => {
      if (isDeviceScannerActive && scannerInputRef.current) scannerInputRef.current.focus();
    };
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, [isDeviceScannerActive]);

  const toggleDeviceScanner = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) return showToast("📱 Tính năng này chỉ dành cho PC!", "warning");

    if (!isDeviceScannerActive) {
      setIsDeviceScannerActive(true);
      setTimeout(() => scannerInputRef.current?.focus(), 100);
      showToast("Sẵn sàng! Đưa mã QR vào trước máy quét.", "success");
    } else {
      setIsDeviceScannerActive(false);
      scannerInputRef.current?.blur();
      showToast("Đã tắt máy quét PC.", "warning");
    }
  };

  const handleScannerInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value) {
      handleScanSuccess(e.currentTarget.value);
      e.currentTarget.value = "";
      setScannerDisplayValue("");
    }
  };

  const handleScannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScannerDisplayValue(e.target.value);
  };


  // ==========================================
  // XÓA DỮ LIỆU INDEXEDDB
  // ==========================================
  const requestClearData = () => setModalConfig({ isOpen: true, message: "Hành động này sẽ xóa sạch danh sách cấp mới (IndexedDB) và không thể khôi phục!" });

  const confirmClearData = async () => {
    try {
      await db.scannedCards.clear();
      showToast("🗑️ Đã xóa sạch dữ liệu!", "warning");
    } catch (error) {
      showToast("❌ Lỗi khi xóa dữ liệu!", "error");
    } finally {
      setModalConfig({ isOpen: false, message: "" });
    }
  };
  const closeModal = () => setModalConfig({ isOpen: false, message: "" });

  const deleteRecord = async (id: number) => { // Thay string bằng number vì ID IndexedDB là số
    try {
      const recordToDelete = await db.scannedCards.get(id);
      if (recordToDelete) {
        await db.scannedCards.delete(id);
        showToast(`🗑️ Đã xóa hồ sơ của: ${recordToDelete.fullName}`, "success");
      }
    } catch (error) {
      showToast("❌ Có lỗi khi xóa hồ sơ!", "error");
    }
  };

  // --- Logic Xuất Excel ---
  const handleExportExcel = async () => {
    if (data.length === 0) {
      return showToast("Chưa có dữ liệu để xuất!", "warning");
    }
    setIsExporting(true);
    setExportProgress(0);
    try {
      // Ép kiểu data hiện tại (ScannedRecord) về chuẩn mảng CCCDRecord để truyền cho hàm export
      await exportToExcel(data as unknown as CCCDRecord[], (percent) => {
        setExportProgress(percent);
      });
      showToast("✅ Đã xử lý file Excel thành công!", "success");
    } catch (error) {
      showToast("❌ Có lỗi xảy ra khi xuất file!", "error");
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(null);
      }, 1000);
    }
  };

  return {
    data,
    isWebCamActive,
    isDeviceScannerActive,
    toasts,
    modalConfig,
    scannerInputRef,
    exportProgress,
    isExporting,
    startWebcam,
    stopWebcam,
    handleFileUpload,
    toggleDeviceScanner,
    handleScannerInput,
    requestClearData,
    confirmClearData,
    closeModal,
    handleExportExcel,
    scannerDisplayValue,
    handleScannerChange,
    isFlashActive,
    deleteRecord,
    sortOrder,     // <---
    setSortOrder
  };
}