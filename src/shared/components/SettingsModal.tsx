import React, { useState, useEffect } from "react";
import { useSettings } from "../hooks/useSettings";
import { toast } from "react-hot-toast";
import { db } from "@/shared/lib/db";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { unitName, updateUnitName, cardsPerBox, updateCardsPerBox } = useSettings();
  const [localUnitName, setLocalUnitName] = useState(unitName);
  const [localCardsPerBox, setLocalCardsPerBox] = useState(cardsPerBox.toString());

  const [deleteTarget, setDeleteTarget] = useState<string>("all");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalUnitName(unitName);
      setLocalCardsPerBox(cardsPerBox.toString());
      setShowConfirm(false);
    }
  }, [isOpen, unitName, cardsPerBox]);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    updateUnitName(localUnitName);
    const parsedCards = parseInt(localCardsPerBox, 10);
    if (!isNaN(parsedCards) && parsedCards > 0) {
      updateCardsPerBox(parsedCards);
    } else {
      setLocalCardsPerBox(cardsPerBox.toString()); // Reset on invalid input
    }
    toast.success("Đã lưu cài đặt hệ thống!");
    onClose();
  };

  const handleBackupDatabase = async () => {
    try {
      setIsProcessing(true);
      await import('dexie-export-import');
      toast("Đang tạo file sao lưu hệ thống...", { icon: "⏳" });

      const blob = await db.export();
      
      const text = await blob.text();
      const parsed = JSON.parse(text);
      parsed.customSettings = {
        unitName: localStorage.getItem("dv_cap_unit_name") || "Tân An",
        cardsPerBox: localStorage.getItem("dv_cap_cards_per_box") || 50
      };
      const finalBlob = new Blob([JSON.stringify(parsed)], { type: "application/json" });

      const url = URL.createObjectURL(finalBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DuLieu_HeThong_${new Date().toISOString().split('T')[0]}.json`;
      a.click();

      URL.revokeObjectURL(url);
      toast.success("Đã tải file sao lưu Toàn bộ Dữ liệu thành công!");
    } catch (error) {
      console.error("Lỗi backup:", error);
      toast.error("Có lỗi xảy ra khi sao lưu dữ liệu!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      await import('dexie-export-import');
      toast("Đang xử lý file sao lưu...", { icon: "⏳" });

      const text = await file.text();
      const parsed = JSON.parse(text);
      
      if (parsed.data && parsed.data.databaseVersion !== undefined) {
        parsed.data.databaseVersion = db.verno;
      }
      
      if (parsed.customSettings) {
        if (parsed.customSettings.unitName) {
          localStorage.setItem("dv_cap_unit_name", parsed.customSettings.unitName);
        }
        if (parsed.customSettings.cardsPerBox) {
          localStorage.setItem("dv_cap_cards_per_box", parsed.customSettings.cardsPerBox.toString());
        }
        window.dispatchEvent(new Event("dv_cap_settings_updated"));
      }

      const modifiedBlob = new Blob([JSON.stringify(parsed)], { type: "application/json" });

      toast("Đang khôi phục toàn bộ hệ thống...", { icon: "⏳" });

      await db.import(modifiedBlob, {
        clearTablesBeforeImport: true,
        acceptMissingTables: true,
        acceptNameDiff: true,
      });

      toast.success("Khôi phục thành công! Đang tải lại trang...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Lỗi restore:", error);
      toast.error("File sao lưu hỏng hoặc không đúng định dạng!");
    } finally {
      setIsProcessing(false);
      e.target.value = "";
    }
  };

  const executeDelete = async () => {
    try {
      setIsProcessing(true);
      if (deleteTarget === "module1") {
        await db.scannedCards.clear();
      } else if (deleteTarget === "module2") {
        await db.cards.clear();
        await db.cardHistory.clear();
        await db.cardImages.clear();
      } else if (deleteTarget === "module3") {
        await db.unissuedCards.clear();
      } else if (deleteTarget === "module4") {
        await db.matchingCards.clear();
      } else if (deleteTarget === "module5") {
        await db.archives.clear();
      } else if (deleteTarget === "all") {
        await db.scannedCards.clear();
        await db.cards.clear();
        await db.cardHistory.clear();
        await db.cardImages.clear();
        await db.unissuedCards.clear();
        await db.matchingCards.clear();
        await db.archives.clear();
        localStorage.removeItem("dv_cap_unit_name");
        localStorage.removeItem("dv_cap_cards_per_box");
      }
      
      toast.success("Đã xóa dữ liệu thành công! Đang tải lại trang...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Lỗi xóa dữ liệu:", error);
      toast.error("Có lỗi xảy ra khi xóa dữ liệu!");
      setIsProcessing(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative">
        
        {/* Modal Xác nhận xoá (Lớp phủ bên trong) */}
        {showConfirm && (
          <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex flex-col justify-center items-center p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cảnh báo Nguy hiểm</h3>
            <p className="text-sm text-gray-600 mb-6">
              Bạn sắp thực hiện xóa dữ liệu. Hành động này <strong className="text-red-600">không thể hoàn tác</strong>. Bạn có chắc chắn muốn tiếp tục không?
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={executeDelete}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? "Đang xóa..." : "Xác nhận Xóa"}
              </button>
            </div>
          </div>
        )}

        <div className="bg-slate-800 px-5 py-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Cài đặt Hệ thống
          </h3>
          <button onClick={onClose} disabled={isProcessing} className="text-slate-400 hover:text-white transition-colors disabled:opacity-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section: Đổi tên đơn vị & Số lượng thẻ */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Thông tin Cơ bản</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tên Đơn vị (Hiển thị Header)</label>
                <input
                  type="text"
                  value={localUnitName}
                  onChange={(e) => setLocalUnitName(e.target.value)}
                  placeholder="Ví dụ: Tân An, Bến Lức..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Số thẻ tối đa mỗi hộp</label>
                <input
                  type="number"
                  min="1"
                  value={localCardsPerBox}
                  onChange={(e) => setLocalCardsPerBox(e.target.value)}
                  placeholder="Ví dụ: 50"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <button 
              onClick={handleSaveSettings}
              disabled={isProcessing}
              className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              Lưu thay đổi Cài đặt
            </button>
          </div>

          <div className="border-t border-slate-100"></div>

          {/* Section: Quản trị dữ liệu */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quản trị Dữ liệu (Sao lưu/Khôi phục)</h4>
            <p className="text-xs text-gray-500 mb-3 italic">
              Lưu ý: Quá trình sao lưu & khôi phục sẽ áp dụng cho <strong>TOÀN BỘ</strong> các phân hệ và cài đặt.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={handleBackupDatabase}
                disabled={isProcessing}
                className="bg-white hover:bg-purple-50 text-purple-700 font-bold py-2.5 px-3 rounded-lg text-sm border border-purple-200 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                💾 Tải File Sao Lưu
              </button>
              
              <label className={`bg-white hover:bg-purple-50 text-purple-700 font-bold py-2.5 px-3 rounded-lg text-sm border border-purple-200 transition-colors shadow-sm flex items-center justify-center gap-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                🔄 Nạp Khôi Phục
                <input type="file" accept=".json" onChange={handleRestoreDatabase} disabled={isProcessing} className="hidden" />
              </label>
            </div>

            <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 mt-6">Vùng nguy hiểm (Xoá dữ liệu)</h4>
            <div className="flex flex-col gap-2">
              <select 
                value={deleteTarget}
                onChange={(e) => setDeleteTarget(e.target.value)}
                disabled={isProcessing}
                className="w-full text-sm p-2.5 border border-red-200 bg-red-50 text-red-900 rounded-lg outline-none focus:ring-2 focus:ring-red-500 font-medium"
              >
                <option value="module1">Phân hệ 1: Xóa danh sách Lập quét</option>
                <option value="module2">Phân hệ 2: Xóa toàn bộ Kho thẻ & Hình ảnh</option>
                <option value="module3">Phân hệ 3: Xóa danh sách Giấy hẹn</option>
                <option value="module4">Phân hệ 4: Xóa danh sách Đối sánh</option>
                <option value="module5">Phân hệ 5: Xóa dữ liệu Tàng thư</option>
                <option value="all" className="font-bold">KHÔI PHỤC CÀI ĐẶT GỐC (XÓA SẠCH MỌI THỨ)</option>
              </select>

              <button
                onClick={() => setShowConfirm(true)}
                disabled={isProcessing}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-3 rounded-lg text-sm shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-1"
              >
                🗑️ Thực hiện Xóa Dữ liệu
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
