import React, { useState, useEffect } from "react";
import { useSettings } from "../hooks/useSettings";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackupDatabase: () => void;
  onRestoreDatabase: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRequestClearData: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onBackupDatabase,
  onRestoreDatabase,
  onRequestClearData
}: SettingsModalProps) {
  const { unitName, updateUnitName } = useSettings();
  const [localUnitName, setLocalUnitName] = useState(unitName);

  useEffect(() => {
    if (isOpen) {
      setLocalUnitName(unitName);
    }
  }, [isOpen, unitName]);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    updateUnitName(localUnitName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="bg-slate-800 px-5 py-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Cài đặt Hệ thống
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Section: Đổi tên đơn vị */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Thông tin Đơn vị</h4>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tên Đơn vị (Hiển thị trên Header)</label>
            <input
              type="text"
              value={localUnitName}
              onChange={(e) => setLocalUnitName(e.target.value)}
              placeholder="Ví dụ: Tân An, Bến Lức..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button 
              onClick={handleSaveSettings}
              className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
            >
              Lưu thay đổi Tên Đơn vị
            </button>
          </div>

          <div className="border-t border-slate-100"></div>

          {/* Section: Quản trị dữ liệu */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quản trị Dữ liệu (IndexedDB)</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onBackupDatabase}
                className="bg-white hover:bg-purple-50 text-purple-700 font-bold py-2.5 px-3 rounded-lg text-sm border border-purple-200 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                💾 Tải File Sao Lưu
              </button>
              
              <label className="bg-white hover:bg-purple-50 text-purple-700 font-bold py-2.5 px-3 rounded-lg text-sm border border-purple-200 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2">
                🔄 Nạp File Khôi Phục
                <input type="file" accept=".json" onChange={onRestoreDatabase} className="hidden" />
              </label>

              <button
                onClick={onRequestClearData}
                className="col-span-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2.5 px-3 rounded-lg text-sm border border-red-200 transition-colors shadow-sm flex items-center justify-center gap-2 mt-1"
              >
                🗑️ Xóa Toàn Bộ Dữ Liệu Kho
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
