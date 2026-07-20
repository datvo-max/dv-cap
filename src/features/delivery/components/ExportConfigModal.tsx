// src/components/ExportConfigModal.tsx
import React, { useState } from "react";
import { COLUMNS_SCHEMA } from "@/shared/utils/exportReturnToExcel";

interface ExportConfigModalProps {
  isOpen: boolean;
  exportType: 'all' | 'returned' | 'pending' | 'selected' | null;
  onClose: () => void;
  onConfirm: (selectedKeys: string[], type: 'all' | 'returned' | 'pending' | 'selected') => void;
}

export default function ExportConfigModal({ isOpen, exportType, onClose, onConfirm }: ExportConfigModalProps) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Đặt mặc định khi mở Modal (Tránh dùng useEffect setState)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      const defaults = COLUMNS_SCHEMA.filter(c => c.defaultChecked).map(c => c.key);
      setSelectedKeys(defaults);
    }
  }

  if (!isOpen || !exportType) return null;

  const handleToggle = (key: string) => {
    setSelectedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    setSelectedKeys(COLUMNS_SCHEMA.map(c => c.key));
  };

  const handleSubmit = () => {
    if (selectedKeys.length === 0) {
      alert("Vui lòng chọn ít nhất 1 trường dữ liệu để xuất!");
      return;
    }
    onConfirm(selectedKeys, exportType);
  };

  const titleMap = {
    all: "Xuất Toàn bộ Kho thẻ",
    returned: "Xuất Danh sách Đã trả (Có phân Sheet theo ngày)",
    pending: "Xuất Danh sách Còn lại",
    selected: "Xuất Danh sách Thẻ đã chọn"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">

        <div className="bg-indigo-600 px-5 py-3 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm">Cấu hình File Báo cáo</h3>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm font-bold text-gray-700 mb-1">{titleMap[exportType]}</p>
          <p className="text-xs text-gray-500 mb-4 flex justify-between items-center">
            Vui lòng chọn các trường dữ liệu muốn hiển thị trong file Excel:
            <button onClick={handleSelectAll} className="text-indigo-600 hover:underline font-semibold">Chọn tất cả</button>
          </p>

          <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            {COLUMNS_SCHEMA.map((col) => (
              <label key={col.key} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedKeys.includes(col.key)}
                  onChange={() => handleToggle(col.key)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 transition-colors">
                  {col.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 px-5 py-3 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors">
            Hủy bỏ
          </button>
          <button onClick={handleSubmit} className="px-6 py-2 rounded-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Tải xuống Excel
          </button>
        </div>
      </div>
    </div>
  );
}