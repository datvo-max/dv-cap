// src/hooks/useScannerApp.ts
import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CCCDRecord } from "@/types/cccd";
import { parseCCCD } from "@/utils/cccdParser";
import { exportToExcel } from "@/utils/exportToExcel";

export function useScannerApp() {
  const [data, setData] = useState<CCCDRecord[]>([]);
  const [isWebCamActive, setIsWebCamActive] = useState(false);
  const [isDeviceScannerActive, setIsDeviceScannerActive] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ msg: string; type: "success" | "error" | "warning" | "info" } | null>(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, message: "" });

  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

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

  // Cập nhật hàm showToast để hỗ trợ loại 'info'
  const showToast = (msg: string, type: "success" | "error" | "warning" | "info") => {
    setToastMsg({ msg, type });
    setTimeout(() => {
      setToastMsg(null);
      setExportProgress(null); // Reset progress khi đóng toast
    }, 3000);
  };

  const handleScanSuccess = (decodedText: string) => {
    const record = parseCCCD(decodedText);
    if (record.idNumber) {
      setData((prev) => [...prev, record]);
      showToast(`✅ Đã thêm: ${record.fullName}`, "success");
    } else {
      showToast(`❌ Lỗi: Mã QR không hợp lệ!`, "error");
    }
  };

  // --- Logic Camera ---
  const startWebcam = async () => {
    setIsWebCamActive(true);
    if (!html5QrCodeRef.current) html5QrCodeRef.current = new Html5Qrcode("reader");
    try {
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScanSuccess,
        () => { }
      );
    } catch (err) {
      showToast("Lỗi mở camera!", "error");
    }
  };

  const stopWebcam = async () => {
    if (html5QrCodeRef.current?.isScanning) await html5QrCodeRef.current.stop();
    setIsWebCamActive(false);
  };

  // --- Logic File Upload ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    showToast("Đang phân tích ảnh...", "warning");

    const fileScanner = new Html5Qrcode("file-scanner");
    let successCount = 0, failCount = 0;
    const newRecords: CCCDRecord[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const text = await fileScanner.scanFile(files[i], false);
        const record = parseCCCD(text);
        if (record.idNumber) { newRecords.push(record); successCount++; }
        else { failCount++; }
      } catch (err) { failCount++; }
    }

    if (newRecords.length > 0) setData((prev) => [...prev, ...newRecords]);
    if (successCount > 0) showToast(`✅ Quét thành công ${successCount} ảnh!`, "success");
    if (failCount > 0) showToast(`⚠️ ${failCount} ảnh không nhận diện được.`, "warning");
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

    setIsDeviceScannerActive((prev) => {
      const newState = !prev;
      if (newState) {
        setTimeout(() => scannerInputRef.current?.focus(), 100);
        showToast("Sẵn sàng! Dùng súng quét mã bắn trực tiếp.", "success");
      } else {
        scannerInputRef.current?.blur();
        showToast("Đã tắt máy quét PC.", "warning");
      }
      return newState;
    });
  };

  const handleScannerInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value) {
      handleScanSuccess(e.currentTarget.value);
      e.currentTarget.value = "";
    }
  };

  // --- Logic Xóa dữ liệu (Modal) ---
  const requestClearData = () => setModalConfig({ isOpen: true, message: "Hành động này không thể khôi phục!" });
  const confirmClearData = () => {
    setData([]);
    showToast("🗑️ Đã xóa sạch dữ liệu!", "warning");
    setModalConfig({ isOpen: false, message: "" });
  };
  const closeModal = () => setModalConfig({ isOpen: false, message: "" });


  const handleExportExcel = async () => {
    if (data.length === 0) {
      return showToast("Chưa có dữ liệu để xuất!", "warning");
    }

    setIsExporting(true);
    showToast("Đang chuẩn bị file Excel...", "info");
    setExportProgress(0);

    try {
      // Gọi hàm export bất đồng bộ
      await exportToExcel(data, (percent) => {
        setExportProgress(percent);
        setToastMsg({ msg: `Đang xuất Excel... ${percent}%`, type: "info" });
      });

      // Thành công
      showToast("✅ Đã xuất file Excel thành công!", "success");
    } catch (error) {
      showToast("❌ Có lỗi xảy ra khi xuất file!", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Cập nhật object return ở cuối file
  return {
    data,
    isWebCamActive,
    isDeviceScannerActive,
    toastMsg,
    modalConfig,
    scannerInputRef,
    exportProgress, // <--- Trả ra ngoài
    isExporting,    // <--- Trả ra ngoài
    startWebcam,
    stopWebcam,
    handleFileUpload,
    toggleDeviceScanner,
    handleScannerInput,
    requestClearData,
    confirmClearData,
    closeModal,
    handleExportExcel, // <--- Trả ra ngoài
  };
}