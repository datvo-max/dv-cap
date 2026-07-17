"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useDebounce } from "@/hooks/useDebounce";
import { removeVietnameseTones } from "@/utils/removeVietnameseTones";

interface ReturnDataTableProps {
  onReturnCard: (idNumber: string) => void;
  onUndoReturn: (id: number) => void;
  onEditCard: (id: number) => void; // MỚI: Thêm prop gọi Modal sửa
}

export default function ReturnDataTable({ onReturnCard, onUndoReturn, onEditCard }: ReturnDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // --- STATE QUẢN LÝ PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Reset về trang 1 mỗi khi người dùng gõ từ khóa tìm kiếm mới
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // =====================================
  // MỚI: TẠO CỘT MỐC VÀ HIỆU ỨNG CUỘN
  // =====================================
  const tableTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    const yOffset = -80;
    if (tableTopRef.current) {
      const y = tableTopRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [currentPage]);
  // =====================================

  const allCards = useLiveQuery(() => db.cards.orderBy('zone').toArray());

  const filteredData = useMemo(() => {
    if (!allCards) return [];
    if (!debouncedSearchTerm) return allCards;

    // 1. Chuyển từ khóa gõ vào thành chữ thường và xóa sạch dấu tiếng Việt
    const normalizedSearchTerm = removeVietnameseTones(debouncedSearchTerm.toLowerCase().trim());

    return allCards.filter(item => {
      // 2. Lấy tên công dân trong DB, chuyển chữ thường và xóa dấu
      const normalizedFullName = removeVietnameseTones(item.fullName.toLowerCase());

      // 3. Tiến hành so sánh
      return (
        normalizedFullName.includes(normalizedSearchTerm) ||
        item.idNumber.includes(normalizedSearchTerm) ||
        (item.phoneNumber && item.phoneNumber.includes(normalizedSearchTerm)) ||
        // Lưu ý: Vì từ khóa đã bị xóa dấu ở bước 1, chữ "hộp" chắc chắn đã thành "hop", 
        // nên chúng ta chỉ cần replace "hop " là đủ để tra cứu chính xác hộp số mấy.
        item.zone.toString().toLowerCase() === normalizedSearchTerm.replace("hop ", "").trim()
      );
    });
  }, [allCards, debouncedSearchTerm]);

  // 2. Tính toán các thông số phân trang
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  // 3. Cắt mảng dữ liệu để chỉ hiển thị đúng số dòng của trang hiện tại
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div ref={tableTopRef} className="bg-white rounded-xl shadow-sm border overflow-hidden w-full flex flex-col">
      {/* THANH TÌM KIẾM */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Tra cứu nhanh theo Tên, Số CCCD hoặc Vị trí (VD: Hộp 3)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto min-h-100">
        <table className="w-full text-xs text-left border-collapse text-gray-600 whitespace-nowrap relative">
          <thead className="bg-gray-100 text-gray-700 font-bold stick z-10 shadow-sm">
            <tr>
              <th className="px-3 py-3 text-center w-12 border-b border-gray-200">STT</th>
              <th className="px-3 py-3 border-b border-gray-200">Vị trí</th>
              <th className="px-3 py-3 border-b border-gray-200">Trạng thái</th>
              <th className="px-3 py-3 border-b border-gray-200">Số CCCD</th>
              <th className="px-3 py-3 border-b border-gray-200">Họ và Tên</th>
              <th className="px-3 py-3 border-b border-gray-200">Ngày Sinh</th>
              <th className="px-3 py-3 max-w-xs border-b border-gray-200">Địa Chỉ</th>
              <th className="px-3 py-3 border-b border-gray-200">Họ tên cha</th>
              <th className="px-3 py-3 border-b border-gray-200">Họ tên mẹ</th>
              <th className="px-3 py-3 text-center w-28 sticky right-0 bg-gray-100 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] border-b border-gray-200">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {!paginatedData || paginatedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-gray-400">
                  {searchTerm ? "Không tìm thấy hồ sơ nào khớp với từ khóa." : "Kho thẻ hiện đang trống. Vui lòng nạp dữ liệu từ Excel."}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => {
                const isReturned = item.status === 'returned';
                // Tính lại số thứ tự (STT) dựa trên số trang
                const actualIndex = startIndex + index + 1;

                return (
                  <tr key={item.id} className={`transition-colors ${isReturned ? 'bg-gray-50 opacity-60' : 'hover:bg-indigo-50/40'}`}>
                    <td className="px-3 py-2.5 text-center text-gray-400 font-normal">{actualIndex}</td>

                    <td className="px-3 py-2.5 font-bold text-indigo-700">
                      {String(item.zone).includes('Hộp') ? item.zone : `Hộp ${item.zone}`}
                    </td>

                    <td className="px-3 py-2.5">
                      {isReturned ? (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px] font-bold">Đã trả</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold animate-pulse">Chưa trả</span>
                      )}
                    </td>

                    <td className="px-3 py-2.5 font-bold text-blue-900">{item.idNumber}</td>
                    <td className="px-3 py-2.5 font-bold text-gray-900">
                      {item.fullName}
                      {/* MỚI: Hiển thị badge nhỏ nếu thẻ không ảnh */}
                      {item.isNoPhoto && <span className="ml-1.5 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[9px] font-bold">K.Ảnh</span>}
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
                        {!isReturned ? (
                          <button
                            onClick={() => onReturnCard(item.idNumber)}
                            className="px-3 py-1 bg-green-500 text-white text-[10px] font-bold rounded shadow-sm hover:bg-green-600 hover:shadow transform hover:scale-105 transition-all"
                            title="Xác nhận đã trả thẻ này cho công dân"
                          >
                            Xác nhận trả
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic" title={`Đã trả lúc: ${item.returnedAt ? new Date(item.returnedAt).toLocaleString('vi-VN') : 'Không rõ'}`}>
                            Đã xử lý
                          </span>
                        )}


                        {/* MỚI: Nút Edit hình Cây viết */}
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
              })
            )}
          </tbody>
        </table>
      </div >

      {/* FOOTER PHÂN TRANG */}
      < div className="p-3 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-600 font-medium" >

        {/* Bộ chọn số lượng hiển thị */}
        <div className="flex items-center gap-2" >
          <span>Hiển thị:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Quay về trang 1 khi đổi số lượng hiển thị
            }}
            className="border border-gray-300 rounded px-2 py-1 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer bg-white"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>dòng / trang</span>
        </div >

        {/* Thông tin tổng quát */}
        <div>
          Đang xem <span className="font-bold text-gray-800" > {totalItems === 0 ? 0 : startIndex + 1
          }</span > - <span className="font-bold text-gray-800">{Math.min(startIndex + itemsPerPage, totalItems)}</span> trong tổng số < span className="font-bold text-indigo-700" > {totalItems}</span > thẻ
        </div >

        {/* Nút điều hướng */}
        < div className="flex items-center gap-1.5" >
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            title="Trang đầu"
            className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            title="Trang trước"
            className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>

          <span className="px-3 font-bold text-indigo-700 bg-indigo-50 py-1 rounded border border-indigo-100">
            Trang {currentPage} / {totalPages || 1}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            title="Trang sau"
            className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
            title="Trang cuối"
            className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
          </button>
        </div >

      </div >
    </div >
  );
}