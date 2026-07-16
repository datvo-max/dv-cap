import { useState, useRef, useCallback, useEffect } from "react";
import { CardRecord, db } from "@/lib/db";
import { Html5Qrcode } from "html5-qrcode";
import XLSX from "xlsx";
import { exportReturnExcel } from "@/utils/exportReturnToExcel";
import { parseCCCD } from "@/utils/cccdParser";



export function useCardReturnApp() {

  // 'import' = Quét để nạp vào kho, 'return' = Quét để trả thẻ
  const [scanMode, setScanMode] = useState<'import' | 'return'>('return');

  // MỚI: Trạng thái Checkbox Thẻ không ảnh lúc nạp
  const [isNoPhotoImport, setIsNoPhotoImport] = useState(false);
  const isNoPhotoImportRef = useRef(false);
  useEffect(() => {
    isNoPhotoImportRef.current = isNoPhotoImport;
  }, [isNoPhotoImport]);

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

  const [modalConfig, setModalConfig] = useState({ isOpen: false, message: "" });

  // MỚI: Cấu hình Modal Chỉnh sửa thông tin thẻ (Nút Cây viết)
  const [editModalConfig, setEditModalConfig] = useState<{ isOpen: boolean; cardId: number | null }>({
    isOpen: false,
    cardId: null
  });

  // Khai báo mảng chứa danh sách Toast
  interface ToastItem {
    id: number;
    msg: string;
    type: "success" | "error" | "warning" | "info";
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((msg: string, type: "success" | "error" | "warning" | "info") => {
    const id = Date.now() + Math.random(); // Tạo ID định danh duy nhất cho mỗi dòng
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
      showToast(`⚠️ Thẻ của ${record.fullName} (${record.idNumber}) đã có trong kho!`, "warning");
      return;
    }


    const today = new Date().toISOString().split('T')[0];
    const isNoPhoto = isNoPhotoImportRef.current;
    let zone: number | string;

    // Tính toán Hộp/Khay tự động
    // Rẽ nhánh logic đếm hộp tự động
    if (isNoPhoto) {
      // Đếm số lượng thẻ không ảnh hiện có
      const noPhotoCount = await db.cards.filter(c => !!c.isNoPhoto).count();
      zone = `K${Math.floor(noPhotoCount / 50) + 1}`;
    } else {
      // Đếm số lượng thẻ bình thường hiện có
      const normalCount = await db.cards.filter(c => !c.isNoPhoto).count();
      zone = Math.floor(normalCount / 50) + 1;
    }

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
      oldIdNumber: record.oldIdNumber || "-",
      gender: record.gender || "-",
      issueDate: record.issueDate || "-",
      canceledIdNumber: record.canceledIdNumber || "-",
      fatherName: record.fatherName || "-",
      motherName: record.motherName || "-",
      isNoPhoto: isNoPhoto // MỚI: Lưu cờ không ảnh
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

    // Cập nhật trạng thái (Dùng Date.now() chuẩn quốc tế)
    await db.cards.update(card.id!, {
      status: 'returned',
      returnedAt: Date.now() // <--- SỬA DÒNG NÀY (Bỏ toLocaleString)
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

        // MỚI: Chỉ đếm thẻ bình thường để xếp Hộp từ Excel
        let currentTotalCount = await db.cards.filter(c => !c.isNoPhoto).count();
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
            importDate: today,
            status: 'pending' as const,
            zone: zone,
            idNumber: idNumber,
            fullName: row['Họ và Tên'] || row['Ho Ten'] || 'Chưa rõ',
            dob: row['Ngày Sinh'] || row['Ngay Sinh'] || '-',
            address: row['Địa Chỉ'] || row['Dia Chi'] || '-',
            type: "Thẻ Căn cước" as const,
            oldIdNumber: "-",
            gender: row['Giới Tính'] || row['Gioi Tinh'] || '-',
            issueDate: row['Ngày Cấp'] || row['Ngay Cap'] || '-',
            canceledIdNumber: "-",
            fatherName: row['Cha'] || row["Họ Tên Cha"] || "-",
            motherName: row['Mẹ'] || row["Me"] || row["Họ Tên Mẹ"] || "-",
            isNoPhoto: false // Mặc định từ Excel là có ảnh
          });

          currentTotalCount++;
          successCount++;
        }

        if (newRecords.length > 0) {
          // Ghi hàng loạt vào IndexedDB
          await db.cards.bulkAdd(newRecords);
          showToast(`✅ Đã thêm thành công ${successCount} thẻ vào hệ thống!`, "success");
        } else {
          showToast(`⚠️ Không có thẻ mới nào được nạp (hoặc bị trùng toàn bộ).`, "warning");
        }
      } catch (err) {
        showToast("❌ Lỗi đọc file Excel. Vui lòng kiểm tra lại định dạng.", "error");
      }
      e.target.value = ""; // Reset input
    };
    reader.readAsArrayBuffer(file);
  };


  // ==========================================
  // 3. LOGIC XUẤT FILE EXCEL THEO YÊU CẦU
  // ==========================================
  // MỚI: State quản lý Modal chọn trường dữ liệu
  const [exportModalConfig, setExportModalConfig] = useState<{
    isOpen: boolean;
    type: 'all' | 'returned' | 'pending' | null;
  }>({ isOpen: false, type: null });

  // Hàm mở Modal thay vì tải ngay lập tức
  const openExportModal = (type: 'all' | 'returned' | 'pending') => {
    setExportModalConfig({ isOpen: true, type });
  };
  const closeExportModal = () => setExportModalConfig({ isOpen: false, type: null });

  // Hàm thực thi sau khi đã chọn xong cột
  const executeExportExcel = async (selectedKeys: string[], type: 'all' | 'returned' | 'pending') => {
    try {
      closeExportModal(); // Đóng modal ngay khi bấm
      setIsExporting(true);
      setExportProgress(0);

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

      // Đẩy selectedKeys vào hàm xuất chuẩn
      await exportReturnExcel(dataToExport, type, selectedKeys, (percent) => {
        setExportProgress(percent);
      });

      let typeName = type === 'all' ? 'Toàn bộ kho' : (type === 'returned' ? 'Đã trả' : 'Còn lại');
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
              fps: 10, qrbox: { width: 250, height: 250 }
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

  // ==========================================
  // 5. LOGIC XÓA DỮ LIỆU KHO THẺ
  // ==========================================
  const requestClearData = () => {
    setModalConfig({
      isOpen: true,
      message: "Hành động này sẽ xóa sạch toàn bộ dữ liệu trong Kho thẻ (IndexedDB) và không thể khôi phục!"
    });
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
  // ==========================================
  // LOGIC HOÀN TÁC TRẠNG THÁI TRẢ THẺ
  // ==========================================
  const undoReturnCard = async (id: number) => {
    try {
      const card = await db.cards.get(id);

      if (!card) {
        showToast("❌ Không tìm thấy hồ sơ thẻ này!", "error");
        return;
      }

      if (card.status === 'pending') {
        showToast("⚠️ Thẻ này vẫn đang ở trong kho mà!", "warning");
        return;
      }

      // Cập nhật ngược lại trạng thái IndexedDB
      await db.cards.update(id, {
        status: 'pending',
        returnedAt: undefined // Xóa thời gian trả thẻ
      });

      showToast(`🔄 Đã khôi phục thẻ của ${card.fullName} về kho (Hộp ${card.zone})`, "info");
    } catch (error) {
      console.error("Lỗi hoàn tác:", error);
      showToast("❌ Có lỗi xảy ra khi hoàn tác!", "error");
    }
  };
  // MỚI: Hàm xử lý lưu thông tin chỉnh sửa (Số điện thoại, trạng thái thẻ)
  const updateCardDetails = async (id: number, updates: Partial<CardRecord>) => {
    try {
      await db.cards.update(id, updates);
      showToast("✅ Đã cập nhật thông tin thành công!", "success");
      setEditModalConfig({ isOpen: false, cardId: null });
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      showToast("❌ Có lỗi xảy ra khi cập nhật thông tin!", "error");
    }
  };
  // MỚI: Hàm xóa thẻ trực tiếp từ Modal Edit
  const deleteCard = async (id: number) => {
    try {
      await db.cards.delete(id);
      showToast("🗑️ Đã xóa thẻ khỏi hệ thống!", "success");
      setEditModalConfig({ isOpen: false, cardId: null });
    } catch (error) {
      console.error("Lỗi xóa thẻ:", error);
      showToast("❌ Có lỗi xảy ra khi xóa thẻ!", "error");
    }
  };


  // Confirm Modal

  const confirmClearData = async () => {
    try {
      // Lệnh xóa trắng toàn bộ dữ liệu trong bảng cards của IndexedDB
      await db.cards.clear();
      showToast("🗑️ Đã xóa sạch dữ liệu kho thẻ!", "warning");
    } catch (error) {
      showToast("❌ Có lỗi xảy ra khi xóa dữ liệu!", "error");
    } finally {
      setModalConfig({ isOpen: false, message: "" });
    }
  };

  const closeModal = () => setModalConfig({ isOpen: false, message: "" });

  // MỚI: Điều khiển Edit Modal
  const openEditModal = (id: number) => setEditModalConfig({ isOpen: true, cardId: id });
  const closeEditModal = () => setEditModalConfig({ isOpen: false, cardId: null });


  return {
    toasts,
    showToast,
    isWebCamActive,
    isFlashActive,
    scannerDisplayValue,
    startWebcam,
    stopWebcam,
    handleScannerChange,
    handleImportExcel,
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
    modalConfig, // <----- Modal
    requestClearData,
    confirmClearData,
    closeModal,
    handleBackupDatabase,
    handleRestoreDatabase,
    undoReturnCard,
    // Trả ra các Hook mới
    isNoPhotoImport,
    setIsNoPhotoImport,
    editModalConfig,
    openEditModal,
    closeEditModal,
    updateCardDetails,
    deleteCard,
    exportModalConfig,
    openExportModal,
    closeExportModal,
    executeExportExcel
  };
}