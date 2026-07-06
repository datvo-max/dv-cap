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

  // 👉  BỌC LOGIC QUÉT CAMERA (XỬ LÝ TRỄ VÀ FLASH)
  const handleCameraScan = (decodedText: string) => {
    // Nếu đang trong thời gian tạm ngưng 1-3s thì bỏ qua không xử lý
    if (isCameraPaused.current) return;

    // Kích hoạt khóa camera ngay lập tức
    isCameraPaused.current = true;

    // Kích hoạt hiệu ứng chớp sáng máy ảnh
    setIsFlashActive(true);
    // Tắt trạng thái kích hoạt sau 100ms để tạo hiệu ứng mờ dần (transition ở UI)
    setTimeout(() => setIsFlashActive(false), 100);

    // Đẩy dữ liệu vào danh sách
    handleScanSuccess(decodedText);

    // ⏱️ TẠM NGƯNG 2 GIÂY TRƯỚC KHI CHO PHÉP QUÉT THẺ TIẾP THEO
    setTimeout(() => {
      isCameraPaused.current = false;
    }, 2000); // Bạn có thể sửa thành 1000 (1s) hoặc 3000 (3s) tùy thực tế



  };

  // --- Logic Camera ---

  const startWebcam = async () => {
    setIsWebCamActive(true);

    // 💡 GIẢI PHÁP CHO ĐIỆN THOẠI: Chờ 150ms để DOM kịp hiển thị khung #reader
    setTimeout(async () => {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("reader");
      }

      try {
        // Kiểm tra xem camera đã đang chạy hay chưa trước khi ra lệnh start
        if (!html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.start(
            { facingMode: "environment" }, // Ưu tiên camera sau của điện thoại
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            handleCameraScan, // Gọi qua hàm chốt chặn thời gian và hiệu ứng flash
            () => { } // Bỏ qua lỗi bắt trượt mã ở từng khung hình
          );
        }
      } catch (err) {
        console.error("Lỗi phần cứng camera:", err);
        showToast("Lỗi mở camera! Vui lòng thử lại hoặc kiểm tra quyền truy cập.", "error");
      }
    }, 150); // 150ms là tỷ lệ vàng để mọi dòng điện thoại kịp hoàn thành chu kỳ render
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
    let failCount = 0; // Không cần biến successCount nữa vì đã có newRecords.length
    const newRecords: CCCDRecord[] = [];

    // Chạy vòng lặp phân tích từng ảnh
    for (let i = 0; i < files.length; i++) {
      try {
        const text = await fileScanner.scanFile(files[i], false);
        const record = parseCCCD(text);

        if (record.idNumber) {
          newRecords.push(record);
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
      }
    }

    // Xử lý dữ liệu sau khi quét xong
    if (newRecords.length > 0) {
      setData((prev) => [...prev, ...newRecords]);

      // Trích xuất danh sách Tên từ các bản ghi thành công
      const namesList = newRecords.map(record => record.fullName);
      let successMessage = "";

      // Logic hiển thị tên thông minh để không làm vỡ giao diện Toast
      if (namesList.length <= 3) {
        successMessage = `✅ Đã thêm: ${namesList.join(", ")}`;
      } else {
        const firstThree = namesList.slice(0, 3).join(", ");
        const remainingCount = namesList.length - 3;
        successMessage = `✅ Đã thêm: ${firstThree} và ${remainingCount} người khác.`;
      }

      showToast(successMessage, "success");
    }

    // Báo lỗi nếu có ảnh mờ/không hợp lệ
    if (failCount > 0) {
      // Dùng setTimeout nhỏ để Toast lỗi không bị đè mất bởi Toast thành công (nếu quét trộn lẫn cả ảnh đúng và ảnh sai)
      setTimeout(() => {
        showToast(`⚠️ Có ${failCount} ảnh bị mờ hoặc không nhận diện được.`, "warning");
      }, newRecords.length > 0 ? 1500 : 0);
    }

    // Reset input file để có thể chọn lại chính file đó ở lần sau
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
        showToast("Sẵn sàng! Đưa mã QR vào trước máy quét.", "success");
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
      setScannerDisplayValue(""); // Xóa dữ liệu trên màn hình
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
      showToast("✅ Đã xử lý file Excel thành công!", "success");
    } catch (error) {
      showToast("❌ Có lỗi xảy ra khi xuất file!", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const deleteRecord = (id: string) => {
    const recordToDelete = data.find(item => item.id === id);

    // Lọc bỏ bản ghi có ID trùng khớp
    setData((prev) => prev.filter((item) => item.id !== id));

    if (recordToDelete) {
      showToast(`🗑️ Đã xóa hồ sơ của: ${recordToDelete.fullName}`, "success");
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
    exportProgress, // <---
    isExporting,    // <--- 
    startWebcam,
    stopWebcam,
    handleFileUpload,
    toggleDeviceScanner,
    handleScannerInput,
    requestClearData,
    confirmClearData,
    closeModal,
    handleExportExcel,
    scannerDisplayValue, // dùng để hiển thị
    handleScannerChange, // dùng để hiển thị
    isFlashActive,
    deleteRecord
  };
}