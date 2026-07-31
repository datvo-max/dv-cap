import React from "react";

interface ReturnDataPaginationProps {
  itemsPerPage: number;
  setItemsPerPage: (val: number) => void;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalItems: number;
  startIndex: number;
  currentPage: number;
  totalPages: number;
}

export default function ReturnDataPagination({
  itemsPerPage,
  setItemsPerPage,
  setCurrentPage,
  totalItems,
  startIndex,
  currentPage,
  totalPages
}: ReturnDataPaginationProps) {
  return (
    <div className="p-3 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-600 font-medium">
      {/* Bộ chọn số lượng hiển thị */}
      <div className="flex items-center gap-2">
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
      </div>

      {/* Thông tin tổng quát */}
      <div>
        Đang xem <span className="font-bold text-gray-800">{totalItems === 0 ? 0 : startIndex + 1}</span> - <span className="font-bold text-gray-800">{Math.min(startIndex + itemsPerPage, totalItems)}</span> trong tổng số <span className="font-bold text-indigo-700">{totalItems}</span> thẻ
      </div>

      {/* Nút điều hướng */}
      <div className="flex items-center gap-1.5">
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
      </div>
    </div>
  );
}
