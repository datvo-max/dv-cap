import { useState, useRef, useCallback, useEffect } from "react";
import { db } from "@/lib/db";
import { Html5Qrcode } from "html5-qrcode";
import XLSX from "xlsx";
import { exportReturnExcel } from "@/utils/exportReturnToExcel";
import { parseCCCD } from "@/utils/cccdParser";

export function useCardReturnApp() {

  // 'import' = Quét để nạp vào kho, 'return' = Quét để trả thẻ
  const [scanMode, setScanMode] = useState<'import' | 'return'>('return');

  // Trạng thái cho Camera & Máy quét phần cứng
  const [isWebCamActive, setIsWebCamActive] = useState(false);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [scannerDisplayValue, setScannerDisplayValue] = useState("");

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<number | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);
  const returnInputRef = useRef<HTMLInputElement>(null);
  const cameraActionRef = useRef<'import' | 'return'>('return'); // Đánh dấu camera đang làm nhiệm vụ gì

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isCameraPaused = useRef(false);

  // Khai báo mảng chứa danh sách Toast
  interface ToastItem {
    id: number;
    msg: string;
    type: "success" | "error" | "warning" | "info";
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Viết lại hàm showToast
  const showToast = useCallback((msg: string, type: "success" | "error" | "warning" | "info") => {
    const id = Date.now() + Math.random(); // Tạo ID định danh duy nhất cho mỗi dòng

    // Thêm thông báo mới vào cuối mảng
    setToasts((prev) => [...prev, { id, msg, type }]);

    // Cài đặt giờ tự hủy chính xác cho dòng thông báo đó
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);



  // ==========================================
  // 1A. LOGIC QUÉT NẠP THẺ LẺ VÀO KHO
  // ==========================================
  const processImportCard = async (rawData: string) => {
    const record = parseCCCD(rawData);

    if (!record.idNumber) {
      showToast("❌ Lỗi: Mã QR không hợp lệ!", "error");
      return;
    }

    // Kiểm tra trùng lặp
    const isExist = await db.cards.where('idNumber').equals(record.idNumber).count();
    if (isExist > 0) {
      showToast(`⚠️ Thẻ của ${record.fullName} đã có trong kho!`, "warning");
      return;
    }

    // Tính toán Hộp/Khay tự động
    const currentTotalCount = await db.cards.count();
    const zone = Math.floor(currentTotalCount / 50) + 1;
    const today = new Date().toISOString().split('T')[0];

    // Ghi vào IndexedDB
    await db.cards.add({
      importDate: today,
      status: 'pending',
      zone: zone,
      idNumber: record.idNumber,
      fullName: record.fullName,
      dob: record.dob,
      address: record.address,
      type: "Thẻ Căn cước",
      oldIdNumber: "-",
      gender: record.gender || "-",
      issueDate: record.issueDate || "-",
      canceledIdNumber: record.canceledIdNumber || "-",
      fatherName: "-",
      motherName: "-"
    });

    showToast(`✅ Đã nạp thẻ: ${record.fullName} (Vị trí: Hộp ${zone})`, "success");
  };

  // ==========================================
  // 1. LOGIC XỬ LÝ NGHIỆP VỤ TRẢ THẺ (CORE)
  // ==========================================
  const processReturnCard = async (rawData: string) => {
    // Trích xuất số CCCD (đề phòng trường hợp quét mã QR trả ra chuỗi dài)
    let idNumber = rawData;
    if (rawData.includes("|")) {
      const parts = rawData.split("|");
      idNumber = parts[0].length === 12 ? parts[0] : (parts.length > 2 ? parts[2] : rawData);
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

    // Cập nhật trạng thái
    await db.cards.update(card.id!, {
      status: 'returned',
      returnedAt: new Date().toLocaleString('vi-VN')
    });

    showToast(`✅ Đã trả thẻ: ${card.fullName} (Vị trí: Hộp ${card.zone})`, "success");
  };

  // ==========================================
  // 2. LOGIC ĐỌC FILE EXCEL & CHIA VÙNG (GIỮ NGUYÊN THỨ TỰ)
  // ==========================================
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast("Đang nạp dữ liệu từ Excel...", "warning");
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const today = new Date().toISOString().split('T')[0];

        // Đếm tổng số thẻ hiện có trong DB để tính tiếp số Hộp
        let currentTotalCount = await db.cards.count();
        let successCount = 0;

        const newRecords = [];

        // Duyệt theo ĐÚNG THỨ TỰ từ trên xuống dưới của file Excel
        for (const row of data) {
          const idNumber = String(row['Số CCCD'] || row['So CCCD'] || row['ID'] || '');
          if (!idNumber) continue;

          // Bỏ qua nếu đã tồn tại
          const isExist = await db.cards.where('idNumber').equals(idNumber).count();
          if (isExist > 0) continue;

          // Thuật toán tính Hộp: Cứ 50 người thì nhảy 1 hộp (dựa vào tổng số đếm)
          const zone = Math.floor(currentTotalCount / 50) + 1;

          newRecords.push({
            // 1. Các trường quản lý kho (Của CardRecord)
            importDate: today,
            status: 'pending' as const,
            zone: zone,

            // 2. Các trường dữ liệu công dân (Của CCCDRecord)
            idNumber: idNumber,
            fullName: row['Họ và Tên'] || row['Ho Ten'] || 'Chưa rõ',
            dob: row['Ngày Sinh'] || row['Ngay Sinh'] || '-',
            address: row['Địa Chỉ'] || row['Dia Chi'] || '-',

            // Các trường điền mặc định để thỏa mãn TypeScript
            type: "Thẻ Căn cước" as const,
            oldIdNumber: "-",
            gender: row['Giới Tính'] || row['Gioi Tinh'] || '-',
            issueDate: row['Ngày Cấp'] || row['Ngay Cap'] || '-',
            canceledIdNumber: "-",
            fatherName: "-",
            motherName: "-"
          });

          currentTotalCount++;
          successCount++;
        }

        if (newRecords.length > 0) {
          // Ghi hàng loạt vào IndexedDB
          await db.cards.bulkAdd(newRecords);
          showToast(`✅ Đã nạp thành công ${successCount} thẻ vào hệ thống!`, "success");
        } else {
          showToast(`⚠️ Không có thẻ mới nào được nạp (hoặc bị trùng toàn bộ).`, "warning");
        }
      } catch (err) {
        showToast("❌ Lỗi đọc file Excel. Vui lòng kiểm tra lại định dạng.", "error");
      }
      e.target.value = ""; // Reset input
    };
    reader.readAsBinaryString(file);
  };

  // ==========================================
  // 3. LOGIC XUẤT FILE EXCEL THEO YÊU CẦU
  // ==========================================
  const handleExportExcel = async (type: 'all' | 'returned' | 'pending') => {
    try {
      setIsExporting(true);
      setExportProgress(0);

      // Lấy dữ liệu từ IndexedDB
      let dataToExport = [];
      if (type === 'all') {
        dataToExport = await db.cards.toArray();
      } else {
        dataToExport = await db.cards.where('status').equals(type).toArray();
      }

      if (dataToExport.length === 0) {
        showToast("⚠️ Không có dữ liệu để xuất!", "warning");
        setIsExporting(false);
        setExportProgress(null);
        return;
      }

      // Gọi hàm xuất Excel chuẩn có Progress Bar
      await exportReturnExcel(dataToExport, type, (percent) => {
        setExportProgress(percent);
      });

      let typeName = type === 'all' ? 'Toàn bộ kho' : (type === 'returned' ? 'Đã trả' : 'Còn lại');
      showToast(`✅ Đã tải xuống file: ${typeName}`, "success");

    } catch (error) {
      showToast("❌ Có lỗi xảy ra khi xuất file!", "error");
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(null);
      }, 1000);
    }
  };

  // ==========================================
  // 4. LOGIC MÁY QUÉT & CAMERA
  // ==========================================
  const handleScannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScannerDisplayValue(e.target.value);
  };


  // --- XỬ LÝ SÚNG QUÉT PC ---
  const handleImportScannerInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value) {
      processImportCard(e.currentTarget.value);
      e.currentTarget.value = "";
    }
  };

  const handleReturnScannerInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value) {
      processReturnCard(e.currentTarget.value);
      e.currentTarget.value = "";
    }
  };

  // --- XỬ LÝ CAMERA ---
  const handleCameraScan = (decodedText: string) => {
    if (isCameraPaused.current) return;

    isCameraPaused.current = true;
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 100);

    // Kiểm tra xem camera đang được mở bằng nút nào để xử lý đúng nghiệp vụ
    if (cameraActionRef.current === 'import') {
      processImportCard(decodedText);
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
            {
              fps: 10, qrbox: (viewfinderWidth, viewfinderHeight) => {
                // Lấy 75% của chiều nào ngắn hơn (để đảm bảo luôn là hình vuông hoàn hảo)
                const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                const qrboxSize = Math.floor(minEdge * 0.75);
                return { width: qrboxSize, height: qrboxSize };
              }
            },
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



  return {
    toasts,
    isWebCamActive,
    isFlashActive,
    scannerDisplayValue,
    startWebcam,
    stopWebcam,
    handleScannerChange,
    handleImportExcel,
    handleExportExcel,
    processReturnCard,
    isExporting,
    exportProgress,
    scanMode,
    setScanMode,
    importInputRef,
    returnInputRef,
    cameraActionRef,
    handleImportScannerInput,
    handleReturnScannerInput,
  };
}