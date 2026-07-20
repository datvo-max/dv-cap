import { useState } from "react";
import { db } from "@/shared/lib/db";
import { exportReturnExcel } from "@/shared/utils/exportReturnToExcel";

export function useSystemUtils(
  showToast: (msg: string, type: "success" | "error" | "warning" | "info") => void,
  selectedIds: Set<number>
) {
  // --- Clear Data ---
  const [modalConfig, setModalConfig] = useState({ isOpen: false, message: "" });
  
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
      await db.cardHistory.clear();
      showToast("🗑️ Đã xóa sạch dữ liệu kho thẻ và lịch sử!", "warning");
    } catch {
      showToast("❌ Có lỗi xảy ra khi xóa dữ liệu!", "error");
    } finally {
      setModalConfig({ isOpen: false, message: "" });
    }
  };

  // --- Backup / Restore ---
  const handleBackupDatabase = async () => {
    try {
      await import('dexie-export-import');
      showToast("Đang tạo file sao lưu hệ thống...", "info");

      const blob = await db.export();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `KhoThe_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();

      URL.revokeObjectURL(url);
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

      await db.import(file, {
        clearTablesBeforeImport: true,
      });

      showToast("✅ Đã khôi phục toàn bộ kho thẻ thành công!", "success");
      e.target.value = "";
    } catch (error) {
      console.error("Lỗi restore:", error);
      showToast("❌ Lỗi khi đọc file sao lưu. Vui lòng kiểm tra lại!", "error");
    }
  };

  // --- Export Excel ---
  const [exportModalConfig, setExportModalConfig] = useState<{ isOpen: boolean; type: 'all' | 'returned' | 'pending' | 'selected' | 'todayImport' | 'returnedToday' | null; }>({ isOpen: false, type: null });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<number | null>(null);

  const openExportModal = (type: 'all' | 'returned' | 'pending' | 'selected' | 'todayImport' | 'returnedToday') => { 
    setExportModalConfig({ isOpen: true, type }); 
  };
  
  const closeExportModal = () => setExportModalConfig({ isOpen: false, type: null });

  const executeExportExcel = async (selectedKeys: string[], type: 'all' | 'returned' | 'pending' | 'selected' | 'todayImport' | 'returnedToday') => {
    try {
      closeExportModal();
      setIsExporting(true);
      setExportProgress(0);

      let dataToExport = [];
      if (type === 'all') {
        dataToExport = await db.cards.toArray();
      } else if (type === 'selected') {
        const idsArray = Array.from(selectedIds);
        dataToExport = await db.cards.where('id').anyOf(idsArray).toArray();
      } else if (type === 'todayImport') {
        const todayString = new Date().toISOString().split('T')[0];
        dataToExport = await db.cards.where('importDate').equals(todayString).toArray();
      } else if (type === 'returnedToday') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        dataToExport = await db.cards.where('status').equals('returned').filter(card => !!card.returnedAt && card.returnedAt >= startOfDay.getTime() && card.returnedAt <= endOfDay.getTime()).toArray();
      } else {
        dataToExport = await db.cards.where('status').equals(type).toArray();
      }

      if (dataToExport.length === 0) {
        showToast("⚠️ Không có dữ liệu để xuất!", "warning");
        setIsExporting(false);
        setExportProgress(null);
        return;
      }

      await exportReturnExcel(dataToExport, type, selectedKeys, (percent) => {
        setExportProgress(percent);
      });

      const typeName = type === 'all' ? 'Toàn bộ kho' : (type === 'returned' ? 'Đã trả' : (type === 'selected' ? 'Đã chọn' : (type === 'todayImport' ? 'Nhận hôm nay' : (type === 'returnedToday' ? 'Đã trả hôm nay' : 'Còn lại'))));
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

  return {
    modalConfig, requestClearData, confirmClearData, closeModal,
    handleBackupDatabase, handleRestoreDatabase,
    exportModalConfig, openExportModal, closeExportModal, executeExportExcel, isExporting, exportProgress
  };
}
