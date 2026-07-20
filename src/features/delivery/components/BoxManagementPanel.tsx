import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/shared/lib/db";
import { Package, Edit3, Merge } from "lucide-react";

interface BoxManagementPanelProps {
  onOpenMergeModal: () => void;
  onOpenRenameModal: () => void;
}

export default function BoxManagementPanel({ onOpenMergeModal, onOpenRenameModal }: BoxManagementPanelProps) {
  // Truy vấn danh sách hộp và số lượng thẻ (chỉ tính thẻ chưa trả)
  const boxes = useLiveQuery(async () => {
    const allCards = await db.cards.where('status').equals('pending').toArray();
    
    const boxMap = new Map<string, number>();
    for (const card of allCards) {
      if (card.zone) {
        const zoneStr = String(card.zone);
        boxMap.set(zoneStr, (boxMap.get(zoneStr) || 0) + 1);
      }
    }

    return Array.from(boxMap.entries())
      .map(([zone, count]) => ({ zone, count }))
      .sort((a, b) => {
        const numA = parseInt(a.zone.replace(/\D/g, "")) || 0;
        const numB = parseInt(b.zone.replace(/\D/g, "")) || 0;
        return numA - numB;
      });
  }, []) || [];

  return (
    <div className="bg-indigo-50/40 p-3 rounded-lg border border-indigo-200 mt-4 flex flex-col h-full max-h-[350px]">
      <p className="text-[11px] font-bold text-indigo-700 uppercase mb-2 flex items-center gap-1.5 shrink-0">
        <Package className="w-4 h-4" />
        Quản lý Hộp Lưu Trữ
      </p>

      {/* Danh sách các hộp */}
      <div className="flex-1 overflow-y-auto min-h-[100px] mb-3 bg-white border border-indigo-100 rounded-md p-2 shadow-inner space-y-1 custom-scrollbar">
        {boxes.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4 italic">Chưa có hộp nào chứa thẻ.</p>
        ) : (
          boxes.map(box => (
            <div key={box.zone} className="flex justify-between items-center bg-indigo-50/50 p-1.5 rounded border border-indigo-50/50 hover:bg-indigo-100/50 hover:border-indigo-100 transition-colors">
              <span className="text-xs font-bold text-indigo-800">
                {box.zone.includes('K') ? box.zone : `Hộp ${box.zone}`}
              </span>
              <span className="text-[10px] bg-white border border-indigo-200 text-indigo-600 px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                {box.count} thẻ
              </span>
            </div>
          ))
        )}
      </div>

      {/* Các nút chức năng */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        <button
          onClick={onOpenMergeModal}
          className="bg-white hover:bg-indigo-50 text-indigo-700 font-bold py-2 px-2 rounded-lg text-xs border border-indigo-300 transition-colors shadow-sm flex flex-col items-center justify-center gap-1"
        >
          <Merge className="w-4 h-4" />
          Gộp Hộp
        </button>
        <button
          onClick={onOpenRenameModal}
          className="bg-white hover:bg-blue-50 text-blue-700 font-bold py-2 px-2 rounded-lg text-xs border border-blue-300 transition-colors shadow-sm flex flex-col items-center justify-center gap-1"
        >
          <Edit3 className="w-4 h-4" />
          Đổi Tên
        </button>
      </div>
    </div>
  );
}
