import React, { useMemo, useState } from "react";
import { db } from "@/shared/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "@/shared/components/ConfirmModal";
import type { CardRecord } from "@/shared/lib/db";

export default function DuplicateDataTable() {
  const allCards = useLiveQuery(() => db.cards.toArray());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [cardToDelete, setCardToDelete] = useState<CardRecord | null>(null);

  const duplicateGroups = useMemo(() => {
    if (!allCards) return [];
    
    // Group cards by idNumber and issueDate
    const groups: Record<string, typeof allCards> = {};
    allCards.forEach(card => {
      // Dùng idNumber làm key cơ bản, nếu không có issueDate thì gom theo idNumber
      const key = `${card.idNumber}_${card.issueDate || 'unknown'}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(card);
    });

    // Filter out groups with only 1 card
    return Object.values(groups).filter(group => group.length > 1);
  }, [allCards]);

  const totalDuplicates = duplicateGroups.reduce((acc, group) => acc + group.length, 0);
  const totalPages = Math.ceil(duplicateGroups.length / itemsPerPage);

  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return duplicateGroups.slice(start, start + itemsPerPage);
  }, [duplicateGroups, currentPage, itemsPerPage]);

  // Reset page when groups change
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden w-full flex flex-col animate-in fade-in zoom-in-95 duration-300 max-h-[calc(100vh-140px)]">
      <div className="bg-amber-50 px-4 py-3 flex justify-between items-center border-b border-amber-200 shrink-0">
        <h3 className="font-bold text-amber-800 flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          Phân tích Dữ liệu Nghi Trùng
        </h3>
        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">
          Phát hiện: {duplicateGroups.length} nhóm trùng ({totalDuplicates} thẻ)
        </span>
      </div>

      <div className="p-4 bg-amber-50/30 text-sm text-amber-700 border-b border-amber-100 shrink-0">
        Tính năng này tự động rà soát toàn bộ kho và phát hiện các trường hợp một số ĐDCN (cùng ngày cấp) được nhập vào kho nhiều lần (nằm ở nhiều hộp khác nhau hoặc cùng hộp). 
        Vui lòng đối chiếu thực tế và xóa các bản ghi dư thừa.
      </div>

      <div className="overflow-auto flex-1 min-h-0 bg-gray-50/20">
        {duplicateGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <svg className="w-16 h-16 mb-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="text-lg font-medium text-gray-500">Tuyệt vời! Không phát hiện thẻ nào bị nhập trùng.</p>
          </div>
        ) : (
          <table className="w-full text-xs text-left border-collapse text-gray-600 whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 uppercase font-bold sticky top-0 z-30 shadow-sm">
              <tr>
                <th className="px-2 py-2 border-b">STT</th>
                <th className="px-2 py-2 border-b bg-blue-50/50 text-blue-700">Hộp Lưu Trữ</th>
                <th className="px-2 py-2 border-b">Trạng Thái</th>
                <th className="px-2 py-2 border-b">Số ĐDCN</th>
                <th className="px-2 py-2 border-b">Họ Tên</th>
                <th className="px-2 py-2 border-b">Ngày Sinh</th>
                <th className="px-2 py-2 border-b">Giới Tính</th>
                <th className="px-2 py-2 border-b">Thường Trú</th>
                <th className="px-2 py-2 border-b">Ngày Cấp</th>
                <th className="px-2 py-2 border-b">Họ Tên Cha</th>
                <th className="px-2 py-2 border-b">Họ Tên Mẹ</th>
                <th className="px-2 py-2 border-b text-center sticky right-0 bg-gray-50 z-40 shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedGroups.map((group, groupIdx) => {
                const absoluteGroupIdx = (currentPage - 1) * itemsPerPage + groupIdx;
                return (
                <React.Fragment key={absoluteGroupIdx}>
                  {/* Dòng Header của Nhóm */}
                  <tr className="bg-amber-100/50">
                    <td colSpan={12} className="px-2 py-2 text-[11px] font-bold text-amber-800 border-y border-amber-200 sticky left-0">
                      Nhóm {absoluteGroupIdx + 1}: Số ĐDCN {group[0].idNumber} - Phát hiện {group.length} thẻ trùng
                    </td>
                  </tr>
                  
                  {/* Các thẻ trong nhóm */}
                  {group.map((card, idx) => (
                    <tr key={card.id} className="hover:bg-amber-50/50 transition-colors border-b border-gray-100 last:border-b-0">
                      <td className="px-2 py-2 font-medium text-gray-400">{idx + 1}</td>
                      <td className="px-2 py-2 bg-blue-50/20">
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-bold">
                          Hộp {card.zone}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        {card.status === 'pending' && <span className="text-blue-600 font-bold">Trong kho</span>}
                        {card.status === 'returned' && <span className="text-green-600 font-bold">Đã trả</span>}
                        {card.status === 'shipping' && <span className="text-orange-600 font-bold">Đang giao</span>}
                      </td>
                      <td className="px-2 py-2 font-bold text-gray-900">{card.idNumber}</td>
                      <td className="px-2 py-2 font-bold text-gray-700">{card.fullName}</td>
                      <td className="px-2 py-2">{card.dob || '-'}</td>
                      <td className="px-2 py-2">{card.gender || '-'}</td>
                      <td className="px-2 py-2 min-w-[200px] truncate max-w-[200px]" title={card.address}>{card.address || '-'}</td>
                      <td className="px-2 py-2">{card.issueDate || 'N/A'}</td>
                      <td className="px-2 py-2 min-w-[120px] max-w-[150px] truncate" title={card.fatherName}>{card.fatherName || '-'}</td>
                      <td className="px-2 py-2 min-w-[120px] max-w-[150px] truncate" title={card.motherName}>{card.motherName || '-'}</td>
                      <td className="px-2 py-2 text-center sticky right-0 bg-white group-hover:bg-amber-50 transition-colors shadow-[-4px_0_10px_rgba(0,0,0,0.02)] z-10">
                        <button
                          onClick={() => setCardToDelete(card)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors"
                          title="Xóa thẻ này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {duplicateGroups.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 px-4 py-3 bg-gray-50/50 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500">
              Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-medium">{Math.min(currentPage * itemsPerPage, duplicateGroups.length)}</span> trong số <span className="font-medium">{duplicateGroups.length}</span> nhóm
            </p>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-sm border border-gray-300 rounded-md py-1 px-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {[10, 50, 100].map(size => (
                <option key={size} value={size}>{size} nhóm / trang</option>
              ))}
            </select>
          </div>

          {totalPages > 1 && (
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 text-sm font-medium text-gray-700">
                Trang {currentPage} / {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {cardToDelete && (
        <ConfirmModal
          isOpen={!!cardToDelete}
          title="Xóa Thẻ Nghi Trùng"
          message={`Bạn có chắc chắn muốn xóa thẻ của ${cardToDelete.fullName} ở Hộp ${cardToDelete.zone}? Hành động này không thể hoàn tác.`}
          onConfirm={async () => {
            if (cardToDelete.id) {
              await db.cards.delete(cardToDelete.id);
              toast.success(`Đã xóa thành công thẻ của ${cardToDelete.fullName}`, {
                duration: 3000,
                position: 'top-center',
              });
            }
            setCardToDelete(null);
          }}
          onCancel={() => setCardToDelete(null)}
        />
      )}
    </div>
  );
}
