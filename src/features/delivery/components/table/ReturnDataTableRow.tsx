import React from "react";
import { CheckCircle, Truck, Archive, Phone, Image } from "lucide-react";
import { CardRecord } from "@/shared/lib/db";

interface ReturnDataTableRowProps {
  item: CardRecord;
  actualIndex: number;
  isSelectMode: boolean;
  isSelected: boolean;
  onToggleSelectCard: (id: number) => void;
  onReturnCard: (id: number) => void;
  onUndoReturn: (id: number) => void;
  onEditCard: (id: number) => void;
  imageCount: number;
}

export default function ReturnDataTableRow({
  item,
  actualIndex,
  isSelectMode,
  isSelected,
  onToggleSelectCard,
  onReturnCard,
  onUndoReturn,
  onEditCard,
  imageCount
}: ReturnDataTableRowProps) {
  const isReturned = item.status === 'returned';

  return (
    <tr className={`transition-colors ${isReturned ? 'bg-gray-50 opacity-60' : 'hover:bg-indigo-50/40'} ${isSelected ? 'bg-indigo-50/30' : ''}`}>
      {isSelectMode && (
        <td className="px-3 py-2.5 text-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => item.id !== undefined && onToggleSelectCard(item.id)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
          />
        </td>
      )}
      <td className="px-3 py-2.5 text-center text-gray-400 font-normal">{actualIndex}</td>

      <td className="px-3 py-2.5 font-bold text-indigo-700">
        {String(item.zone).includes('Hộp') ? item.zone : `Hộp ${item.zone}`}
      </td>

      <td className="px-3 py-2.5 text-center">
        <div className="flex items-center justify-center gap-2">
          {/* Icon 1: Trạng thái trả thẻ */}
          {item.status === 'returned' && (
            <span title="Thẻ đã trả cho công dân" className="cursor-help">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </span>
          )}
          {item.status === 'shipping' && (
            <span title="Thẻ đang giao shipper" className="cursor-help">
              <Truck className="w-4 h-4 text-amber-600" />
            </span>
          )}
          {item.status === 'pending' && (
            <span title="Thẻ chưa trả (lưu trong kho)" className="cursor-help">
              <Archive className="w-4 h-4 text-indigo-600" />
            </span>
          )}

          {/* Icon 2: Số điện thoại */}
          {item.phoneNumber && item.phoneNumber.trim() !== "" ? (
            <span title={`Đã có SĐT: ${item.phoneNumber}`} className="cursor-help">
              <Phone className="w-4 h-4 text-blue-600" />
            </span>
          ) : (
            <span title="Chưa có số điện thoại" className="cursor-help">
              <Phone className="w-4 h-4 text-gray-300" />
            </span>
          )}

          {/* Icon 3: Số lượng ảnh */}
          {(() => {
            let iconColor = "text-gray-300";
            if (imageCount >= 4) iconColor = "text-emerald-600";
            else if (imageCount > 0) iconColor = "text-amber-500";
            return (
              <span
                title={`Ảnh đính kèm: ${imageCount}/4 ảnh`}
                className={`flex items-center font-bold text-[10px] cursor-help ${iconColor}`}
              >
                <Image className="w-4 h-4" />
                {imageCount > 0 && imageCount < 4 && (
                  <span className="ml-0.5 text-[9px] leading-none">{imageCount}</span>
                )}
              </span>
            );
          })()}
        </div>
      </td>

      <td className="px-3 py-2.5 font-bold text-blue-900">{item.idNumber}</td>
      <td className="px-3 py-2.5 font-bold text-gray-900">
        <div className="flex items-center gap-1.5">
          <span>{item.fullName}</span>
          {item.isNoPhoto && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[9px] font-bold">K.Ảnh</span>}
        </div>
        {item.status === 'shipping' && (
          <div className="text-[10px] text-amber-700 font-semibold mt-0.5 flex items-center gap-0.5 font-sans">
            <span>🛵 Shipper: {item.shipperName} - {item.shipperPhone}</span>
          </div>
        )}
      </td>
      <td className="px-3 py-2.5 text-gray-700">
        {item.dob?.length === 8
          ? item.dob.replace(/(\d{2})(\d{2})(\d{4})/, "$1-$2-$3")
          : (item.dob || "-")}
      </td>
      <td className="px-3 py-2.5 max-w-50 overflow-hidden text-ellipsis text-gray-500 font-normal" title={item.address}>
        {item.address}
      </td>
      <td className="px-3 py-2.5 text-gray-700">{item.fatherName}</td>
      <td className="px-3 py-2.5 text-gray-700">{item.motherName}</td>
      <td className="px-3 py-2.5 text-center sticky right-0 bg-white group-hover:bg-indigo-50/40 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] transition-colors">
        <div className="flex items-center justify-end">
          {item.status === 'returned' && (
            <span className="text-[10px] text-gray-400 italic" title={`Đã trả lúc: ${item.returnedAt ? new Date(item.returnedAt).toLocaleString('vi-VN') : 'Không rõ'}`}>
              Đã xử lý
            </span>
          )}
          {item.status === 'pending' && (
            <button
              onClick={() => item.id !== undefined && onReturnCard(item.id)}
              className="px-3 py-1 bg-green-500 text-white text-[10px] font-bold rounded-md shadow-sm hover:bg-green-600 hover:shadow transform hover:scale-105 transition-all cursor-pointer"
              title="Xác nhận đã trả thẻ này cho công dân"
            >
              Xác nhận trả
            </button>
          )}
          {item.status === 'shipping' && (
            <div className="flex gap-1">
              <button
                onClick={() => item.id !== undefined && onReturnCard(item.id)}
                className="px-2 py-0.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold rounded-md shadow-sm transition-all cursor-pointer"
                title="Xác nhận shipper đã giao thẻ thành công"
              >
                Đã giao
              </button>
              <button
                onClick={() => item.id !== undefined && onUndoReturn(item.id)}
                className="px-2 py-0.5 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold rounded-md shadow-sm transition-all cursor-pointer"
                title="Hủy giao và đưa thẻ lại vào kho"
              >
                Hoàn kho
              </button>
            </div>
          )}

          <button
            onClick={() => { if (item.id !== undefined) onEditCard(item.id); }}
            title="Chỉnh sửa (SĐT / Không ảnh)"
            className="ml-2 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 p-1 rounded-md border border-blue-200 transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
