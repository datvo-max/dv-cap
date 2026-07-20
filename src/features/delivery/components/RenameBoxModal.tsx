import React, { useState, useEffect } from "react";
import { db } from "@/shared/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

interface RenameBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (oldBox: string, newBoxName: string) => void;
  onShowToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export default function RenameBoxModal({ isOpen, onClose, onRename, onShowToast }: RenameBoxModalProps) {
  const [oldBox, setOldBox] = useState("");
  const [newBoxName, setNewBoxName] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  // Truy vấn danh sách hộp
  const availableBoxes = useLiveQuery(async () => {
    if (!isOpen) return [];
    const cards = await db.cards.toArray();
    const zones = cards.map(c => String(c.zone)).filter(Boolean);
    const uniqueZones = Array.from(new Set(zones)).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.replace(/\D/g, "")) || 0;
      return numA - numB;
    });
    return uniqueZones;
  }, [isOpen]) || [];

  useEffect(() => {
    if (isOpen) {
      setOldBox("");
      setNewBoxName("");
      setIsConfirming(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestRename = () => {
    if (!oldBox) {
      onShowToast("⚠️ Vui lòng chọn hộp cần đổi tên!", "warning");
      return;
    }
    if (!newBoxName.trim()) {
      onShowToast("⚠️ Vui lòng nhập tên hộp mới!", "warning");
      return;
    }
    if (oldBox === newBoxName.trim()) {
      onShowToast("⚠️ Tên mới phải khác với tên cũ!", "warning");
      return;
    }
    setIsConfirming(true);
  };

  const executeRename = () => {
    onRename(oldBox, newBoxName.trim());
    setIsConfirming(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

        <div className="bg-blue-600 px-5 py-3 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm">Đổi tên Hộp Lưu Trữ</h3>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-200 leading-relaxed">
            <strong>Lưu ý:</strong> Hành động này sẽ thay đổi vị trí của <strong>tất cả</strong> thẻ đang nằm trong hộp cũ sang hộp mới.
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Hộp cần đổi tên</label>
            <select value={oldBox} onChange={(e) => setOldBox(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-2">
              <option value="">-- Chọn hộp --</option>
              {availableBoxes.map(b => (
                <option key={`old-${b}`} value={b}>{b.includes('K') ? b : `Hộp ${b}`}</option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-700 mb-1">Tên hộp mới</label>
            <input
              type="text"
              value={newBoxName}
              onChange={(e) => setNewBoxName(e.target.value.toUpperCase())}
              placeholder="Nhập tên hộp mới (VD: K1, 12...)"
              className="w-full px-3 py-2 border border-blue-300 rounded text-sm font-bold text-blue-700 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-gray-50 px-5 py-3 border-t flex justify-end gap-2 relative">
          {/* CỤM NÚT XÁC NHẬN CÓ POP-UP */}
          {isConfirming && (
            <div className="absolute bottom-full right-5 mb-2 bg-white border border-blue-200 shadow-xl rounded-lg p-2 flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200 whitespace-nowrap">
              <span className="text-xs text-blue-700 font-bold px-1">Đổi {oldBox} thành {newBoxName}?</span>
              <button
                onClick={executeRename}
                className="px-2 py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded shadow-sm hover:bg-blue-700"
              >Xác nhận</button>
              <button
                onClick={() => setIsConfirming(false)}
                className="px-2 py-1.5 bg-gray-100 text-gray-600 text-[11px] font-bold rounded hover:bg-gray-200"
              >Hủy</button>
              {/* Mũi tên trỏ xuống */}
              <div className="absolute -bottom-1 right-8 w-2 h-2 bg-white border-b border-r border-blue-200 transform rotate-45"></div>
            </div>
          )}

          <button onClick={onClose} className="px-4 py-2 rounded text-sm font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors">
            Hủy bỏ
          </button>
          <button onClick={handleRequestRename} className="px-6 py-2 rounded text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
