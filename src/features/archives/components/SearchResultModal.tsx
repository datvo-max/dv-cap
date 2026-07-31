import React, { useEffect, useRef } from 'react';
import { CardRecord } from '@/shared/lib/db';
import { X, Search } from 'lucide-react';

interface SearchResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: CardRecord[];
  selectedIndex: number;
  onSelect: (card: CardRecord) => void;
  searchTerm: string;
}

export default function SearchResultModal({
  isOpen,
  onClose,
  suggestions,
  selectedIndex,
  onSelect,
  searchTerm
}: SearchResultModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Cuộn tới mục đang chọn
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const activeEl = modalRef.current.querySelector('.active-suggestion');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-blue-200 z-50 overflow-hidden max-h-[300px] flex flex-col">
      <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex justify-between items-center text-sm font-semibold text-blue-800">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          <span>Có {suggestions.length} kết quả khớp với "{searchTerm}"</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="overflow-y-auto flex-1" ref={modalRef}>
        {suggestions.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {searchTerm.length === 12 
              ? "Không tìm thấy dữ liệu. Nhấn Enter để tiếp tục nhập liệu." 
              : "Không tìm thấy dữ liệu. Hãy nhập đủ 12 số để thêm thủ công."}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {suggestions.map((card, index) => (
              <li
                key={card.id || card.idNumber}
                onClick={() => onSelect(card)}
                className={`p-3 cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-100 active-suggestion border-l-4 border-blue-500'
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-gray-800">{card.idNumber}</div>
                    <div className="text-sm font-medium text-blue-700">{card.fullName}</div>
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    <div>{card.dob}</div>
                    <div className="truncate max-w-[150px]" title={card.address}>{card.address}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
        <span>Mũi tên ⬆️ ⬇️ để chọn</span>
        <span>Enter ↵ để xác nhận</span>
      </div>
    </div>
  );
}
