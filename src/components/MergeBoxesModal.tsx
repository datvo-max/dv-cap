// src/components/MergeBoxesModal.tsx
import React, { useState, useEffect } from "react";
import { db } from "@/lib/db";

interface MergeBoxesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMerge: (boxA: string, boxB: string, newBoxName: string) => void;
  onShowToast: (msg: string, type: "success" | "error" | "warning" | "info") => void; // MỚI: Nhận hàm Toast
}

export default function MergeBoxesModal({ isOpen, onClose, onMerge, onShowToast }: MergeBoxesModalProps) {
  const [availableBoxes, setAvailableBoxes] = useState<string[]>([]);
  const [boxA, setBoxA] = useState("");
  const [boxB, setBoxB] = useState("");
  const [newBoxName, setNewBoxName] = useState("");

  // MỚI: State quản lý Pop-up xác nhận gộp
  const [isConfirmingMerge, setIsConfirmingMerge] = useState(false);

  useEffect(() => {
    async function fetchBoxes() {
      if (isOpen) {
        const cards = await db.cards.toArray();
        const zones = cards.map(c => String(c.zone)).filter(Boolean);
        const uniqueZones = Array.from(new Set(zones)).sort((a, b) => {
          const numA = parseInt(a.replace(/\D/g, "")) || 0;
          const numB = parseInt(b.replace(/\D/g, "")) || 0;
          return numA - numB;
        });
        setAvailableBoxes(uniqueZones);
        setBoxA(""); setBoxB(""); setNewBoxName("");
        setIsConfirmingMerge(false); // Reset trạng thái pop-up
      }
    }
    fetchBoxes();
  }, [isOpen]);

  if (!isOpen) return null;

  // Hàm kiểm tra điều kiện trước khi bật Pop-up xác nhận
  const handleRequestMerge = () => {
    if (!boxA || !boxB) {
      onShowToast("⚠️ Vui lòng chọn đủ 2 hộp cần gộp!", "warning");
      return;
    }
    if (boxA === boxB) {
      onShowToast("⚠️ Hai hộp cần gộp phải khác nhau!", "warning");
      return;
    }
    if (!newBoxName.trim()) {
      onShowToast("⚠️ Vui lòng nhập tên cho hộp sau khi gộp!", "warning");
      return;
    }
    // Nếu pass hết các lỗi -> Bật Pop-up xác nhận
    setIsConfirmingMerge(true);
  };

  // Hàm thực thi gộp
  const executeMerge = () => {
    onMerge(boxA, boxB, newBoxName.trim());
    setIsConfirmingMerge(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

        <div className="bg-indigo-600 px-5 py-3 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm">Gộp Hộp Lưu Trữ</h3>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-200 leading-relaxed">
            <strong>Lưu ý:</strong> Sau khi gộp, hệ thống sẽ bỏ qua giới hạn 50 thẻ/hộp cho hộp mới này. Toàn bộ thẻ chưa trả của 2 hộp cũ sẽ được chuyển sang hộp mới.
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Hộp thứ nhất</label>
              <select value={boxA} onChange={(e) => setBoxA(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">-- Chọn hộp --</option>
                {availableBoxes.map(b => (
                  <option key={`A-${b}`} value={b}>{b.includes('K') ? b : `Hộp ${b}`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Hộp thứ hai</label>
              <select value={boxB} onChange={(e) => setBoxB(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">-- Chọn hộp --</option>
                {availableBoxes.map(b => (
                  <option key={`B-${b}`} value={b}>{b.includes('K') ? b : `Hộp ${b}`}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-700 mb-1">Tên hộp sau khi gộp</label>
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={() => boxA && setNewBoxName(boxA)} className="text-[10px] px-2 py-1 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors">Dùng tên hộp 1</button>
              <button type="button" onClick={() => boxB && setNewBoxName(boxB)} className="text-[10px] px-2 py-1 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors">Dùng tên hộp 2</button>
            </div>
            <input
              type="text"
              value={newBoxName}
              onChange={(e) => setNewBoxName(e.target.value.toUpperCase())}
              placeholder="Nhập tên hộp mới (VD: K1, K2...)"
              className="w-full px-3 py-2 border border-indigo-300 rounded text-sm font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="bg-gray-50 px-5 py-3 border-t flex justify-end gap-2 relative">
          {/* CỤM NÚT XÁC NHẬN CÓ POP-UP */}
          {isConfirmingMerge && (
            <div className="absolute bottom-full right-5 mb-2 bg-white border border-indigo-200 shadow-xl rounded-lg p-2 flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200 whitespace-nowrap">
              <span className="text-xs text-indigo-700 font-bold px-1">Chắc chắn gộp {boxA} và {boxB} vào {newBoxName}?</span>
              <button
                onClick={executeMerge}
                className="px-2 py-1.5 bg-indigo-600 text-white text-[11px] font-bold rounded shadow-sm hover:bg-indigo-700"
              >Xác nhận</button>
              <button
                onClick={() => setIsConfirmingMerge(false)}
                className="px-2 py-1.5 bg-gray-100 text-gray-600 text-[11px] font-bold rounded hover:bg-gray-200"
              >Hủy</button>
              {/* Mũi tên trỏ xuống */}
              <div className="absolute -bottom-1 right-8 w-2 h-2 bg-white border-b border-r border-indigo-200 transform rotate-45"></div>
            </div>
          )}

          <button onClick={onClose} className="px-4 py-2 rounded text-sm font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors">
            Hủy bỏ
          </button>
          <button onClick={handleRequestMerge} className="px-6 py-2 rounded text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
            Xác nhận Gộp
          </button>
        </div>
      </div>
    </div>
  );
}