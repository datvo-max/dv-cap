// src/hooks/useScannerApp.ts
import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CCCDRecord } from "@/types/cccd";
import { parseCCCD } from "@/utils/cccdParser";
import { exportToExcel } from "@/utils/exportToExcel";

export function useScannerApp() {
  const [data, setData] = useState<CCCDRecord[]>([]);
  const [isWebCamActive, setIsWebCamActive] = useState(false);
  const [isDeviceScannerActive, setIsDeviceScannerActive] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, message: "" });

  const [scannerDisplayValue, setScannerDisplayValue] = useState("");

  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // 👉 1. THÊM STATE FLASH VÀ REF KHÓA CAMERA
  const [isFlashActive, setIsFlashActive] = useState(false);
  const isCameraPaused = useRef(false); // Dùng ref để khóa lập tức, tránh độ trễ của State

  const scannerInputRef = useRef<HTMLInputElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Load / Save dữ liệu LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("cccd_data");
    if (saved) setData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("cccd_data", JSON.stringify(data));
  }, [data]);

  // Khai báo mảng chứa danh sách Toast (Xếp chồng)
  interface ToastItem {
    id: number;
    msg: string;
    type: "success" | "error" | "warning" | "info";
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Hàm showToast đã nâng cấp cho dạng mảng
  const showToast = useCallback((msg: string, type: "success" | "error" | "warning" | "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const handleScanSuccess = (decodedText: string) => {
    const record = parseCCCD(decodedText);

    // Kiểm tra định dạng mã QR có hợp lệ không
    if (!record.idNumber) {
      showToast(`❌ Lỗi: Mã QR không hợp lệ!`, "error");
      return;
    }

    // 🔥 CHỐT CHẶN: Kiểm tra xem Số CCCD này đã tồn tại trong mảng data chưa
    const isDuplicate = data.some((item) => item.idNumber === record.idNumber);

    if (isDuplicate) {
      showToast(`⚠️ Thông tin ${record.fullName} đã tồn tại`, "warning");
      return;
    }

    // Nếu không trùng thì tiến hành lưu bình thường
    setData((prev) => [...prev, record]);
    showToast(`✅ Đã thêm: ${record.fullName}`, "success");
  };

  // 👉  BỌC LOGIC QUÉT CAMERA (XỬ LÝ TRỄ VÀ FLASH)
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

  // --- Logic Camera ---
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
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
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

  // 2. CẬP NHẬT LUỒNG TẢI FILE ẢNH LÊN
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    showToast("Đang phân tích ảnh...", "warning");

    const fileScanner = new Html5Qrcode("file-scanner");
    let failCount = 0;
    const newRecords: CCCDRecord[] = [];
    const duplicateNames: string[] = [];

    const existingIds = new Set(data.map(item => item.idNumber));

    for (let i = 0; i < files.length; i++) {
      try {
        const text = await fileScanner.scanFile(files[i], false);
        const record = parseCCCD(text);

        if (record.idNumber) {
          const isAlreadyExists = existingIds.has(record.idNumber) || newRecords.some(r => r.idNumber === record.idNumber);

          if (isAlreadyExists) {
            duplicateNames.push(record.fullName);
          } else {
            newRecords.push(record);
          }
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
      }
    }

    if (newRecords.length > 0) {
      setData((prev) => [...prev, ...newRecords]);

      const namesList = newRecords.map(record => record.fullName);
      let successMessage = "";

      if (namesList.length <= 3) {
        successMessage = `✅ Đã thêm: ${namesList.join(", ")}`;
      } else {
        const firstThree = namesList.slice(0, 3).join(", ");
        const remainingCount = namesList.length - 3;
        successMessage = `✅ Đã thêm: ${firstThree} và ${remainingCount} người khác.`;
      }
      showToast(successMessage, "success");
    }

    if (duplicateNames.length > 0) {
      setTimeout(() => {
        if (duplicateNames.length <= 2) {
          duplicateNames.forEach(name => {
            showToast(`⚠️ Thông tin ${name} đã tồn tại`, "warning");
          });
        } else {
          showToast(`⚠️ Có ${duplicateNames.length} hồ sơ bị trùng lặp và đã bị bỏ qua.`, "warning");
        }
      }, newRecords.length > 0 ? 1500 : 0);
    }

    if (failCount > 0) {
      setTimeout(() => {
        showToast(`❌ Có ${failCount} ảnh bị mờ hoặc không nhận diện được.`, "error");
      }, (newRecords.length > 0 || duplicateNames.length > 0) ? 3000 : 0);
    }

    e.target.value = "";
  };

  // --- Logic Máy quét PC ---
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

    // Tách bạch logic ra ngoài hàm cập nhật State
    if (!isDeviceScannerActive) {
      // Bật máy quét
      setIsDeviceScannerActive(true);
      setTimeout(() => scannerInputRef.current?.focus(), 100);
      showToast("Sẵn sàng! Đưa mã QR vào trước máy quét.", "success");
    } else {
      // Tắt máy quét
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

  // --- Logic Xóa dữ liệu (Modal) ---
  const requestClearData = () => setModalConfig({ isOpen: true, message: "Hành động này không thể khôi phục!" });
  const confirmClearData = () => {
    setData([]);
    showToast("🗑️ Đã xóa sạch dữ liệu!", "warning");
    setModalConfig({ isOpen: false, message: "" });
  };
  const closeModal = () => setModalConfig({ isOpen: false, message: "" });

  // --- Logic Xuất Excel ---
  const handleExportExcel = async () => {
    if (data.length === 0) {
      return showToast("Chưa có dữ liệu để xuất!", "warning");
    }

    setIsExporting(true);
    setExportProgress(0); // Kích hoạt thanh Progress Bar

    try {
      await exportToExcel(data, (percent) => {
        setExportProgress(percent); // Chỉ truyền phần trăm vào đây, không gọi setToastMsg nữa
      });

      showToast("✅ Đã xử lý file Excel thành công!", "success");
    } catch (error) {
      showToast("❌ Có lỗi xảy ra khi xuất file!", "error");
    } finally {
      // Đợi 1 giây để người dùng kịp nhìn thấy 100% rồi mới ẩn thanh tiến trình
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(null);
      }, 1000);
    }
  };

  const deleteRecord = (id: string) => {
    const recordToDelete = data.find(item => item.id === id);
    setData((prev) => prev.filter((item) => item.id !== id));

    if (recordToDelete) {
      showToast(`🗑️ Đã xóa hồ sơ của: ${recordToDelete.fullName}`, "success");
    }
  };

  return {
    data,
    isWebCamActive,
    isDeviceScannerActive,
    toasts,              // Đã xuất đúng mảng toasts ra ngoài
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
    deleteRecord
  };
}