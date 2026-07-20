import React, { useState, useEffect } from "react";
import { db } from "@/shared/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

interface MoveCardsBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newZone: number | string) => void;
}

export default function MoveCardsBoxModal({ isOpen, onClose, onConfirm }: MoveCardsBoxModalProps) {
  const [newZone, setNewZone] = useState("");
  const [error, setError] = useState("");

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setNewZone("");
      setError("");
    }
  }

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const zoneTrimmed = newZone.trim();
    if (!zoneTrimmed) {
      setError("Vui lòng nhập vị trí/hộp mới!");
      return;
    }
    
    // Nếu là số thì parse thành số, không thì giữ nguyên string
    const zoneValue = isNaN(Number(zoneTrimmed)) ? zoneTrimmed : Number(zoneTrimmed);
    onConfirm(zoneValue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="bg-indigo-600 px-5 py-3 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            Chuyển hộp cho thẻ đã chọn
          </h3>
          <button type="button" onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <p className="text-xs text-gray-500 font-medium">
              Vui lòng chọn hoặc nhập vị trí/hộp mới để chuyển toàn bộ các thẻ đã chọn sang.
            </p>

            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg animate-pulse">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Vị trí/Hộp mới <span className="text-red-500">*</span></label>
              <input
                type="text"
                list="box-list"
                value={newZone}
                onChange={(e) => { setNewZone(e.target.value.toUpperCase()); setError(""); }}
                placeholder="Ví dụ: 10, K10..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                autoFocus
              />
              <datalist id="box-list">
                {availableBoxes.map(b => (
                  <option key={b} value={b} />
                ))}
              </datalist>

              {availableBoxes.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-gray-500 mb-2">Chọn nhanh hộp đã có:</p>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {availableBoxes.map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => { setNewZone(b); setError(""); }}
                        className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-xs font-bold hover:bg-indigo-100 transition-colors"
                      >
                        {b.includes('K') ? b : `Hộp ${b}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-5 py-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Xác nhận chuyển
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
