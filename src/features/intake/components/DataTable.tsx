import { ScannedRecord } from "@/shared/lib/db";
import { useState, useMemo, useRef, useEffect } from "react";

interface DataTableProps {
  data: ScannedRecord[];
  onDeleteRow: (id: number) => void;
}

export default function DataTable({ data, onDeleteRow }: DataTableProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | undefined>(undefined);

  // --- STATE QUẢN LÝ PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // --- TẠO CỘT MỐC VÀ HIỆU ỨNG CUỘN ---
  const tableTopRef = useRef<HTMLDivElement>(null);
  const prevPageRef = useRef<number>(currentPage);

  useEffect(() => {
    if (prevPageRef.current !== currentPage) {
      prevPageRef.current = currentPage;
      const yOffset = -80;
      if (tableTopRef.current) {
        const y = tableTopRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }, [currentPage]);

  // Nếu dữ liệu thay đổi số lượng (ví dụ xoá, thêm), kiểm tra lại trang hiện tại
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(data.length / itemsPerPage));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [data.length, itemsPerPage, currentPage]);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedData = useMemo(() => {
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, startIndex, itemsPerPage]);

  if (totalItems === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border text-center text-gray-400 font-medium">
        📂 Chưa có dữ liệu được quét. Vui lòng bật camera hoặc sử dụng máy quét vật lý.
      </div>
    );
  }

  return (
    <div ref={tableTopRef} className="bg-white rounded-xl shadow-sm border overflow-hidden w-full flex flex-col">
      <div className="overflow-x-auto min-h-100">
        <table className="w-full text-xs text-left border-collapse text-gray-600 whitespace-nowrap">
          {/* GIẢM PADDING TIÊU ĐỀ */}
          <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-center w-10">STT</th>
              <th className="px-3 py-2">Số ĐDCN</th>
              <th className="px-3 py-2">Họ và Tên</th>
              <th className="px-3 py-2">Ngày Sinh</th>
              <th className="px-3 py-2">Giới Tính</th>
              <th className="px-3 py-2 max-w-xs overflow-hidden text-ellipsis">Địa Chỉ Thường Trú</th>
              <th className="px-3 py-2">Ngày Cấp</th>
              <th className="px-3 py-2">Số ĐDCN Đã Huỷ</th>
              <th className="px-3 py-2">Họ Tên Cha</th>
              <th className="px-3 py-2">Họ Tên Mẹ</th>
              <th className="px-3 py-2 text-center w-16 sticky right-0 bg-gray-50 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">Thao tác</th>
            </tr>
          </thead>
          {/* GIẢM THỂ TÍCH DÒNG (DÂY LÀ PHẦN THU GỌN MARGIN/PADDING CỦA DÒNG) */}
          <tbody className="divide-y divide-gray-100 font-medium">
            {paginatedData.map((item, index) => {
              const actualIndex = startIndex + index + 1;
              return (
                <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-3 py-1.5 text-center text-gray-400 font-normal">{actualIndex}</td>
                  <td className="px-3 py-1.5 font-bold text-blue-900">{item.idNumber}</td>
                  <td className="px-3 py-1.5 font-bold text-gray-900">{item.fullName}</td>
                  <td className="px-3 py-1.5 text-gray-700">
                    {item.dob?.length === 8
                      ? item.dob.replace(/(\d{2})(\d{2})(\d{4})/, "$1-$2-$3")
                      : (item.dob || "-")}
                  </td>
                  <td className="px-3 py-1.5 text-gray-700">{item.gender}</td>
                  <td className="px-3 py-1.5 max-w-xs overflow-hidden text-ellipsis text-gray-500 font-normal" title={item.address}>
                    {item.address}
                  </td>
                  <td className="px-3 py-1.5 text-gray-700">{item.issueDate}</td>
                  <td className="px-3 py-1.5 text-gray-600">{item.canceledIdNumber || "-"}</td>
                  <td className="px-3 py-1.5 text-gray-600">{item.fatherName || "-"}</td>
                  <td className="px-3 py-1.5 text-gray-600">{item.motherName || "-"}</td>
  
                  <td className="px-3 py-1.5 text-center relative right-0 bg-white shadow-[-4px_0_10px_rgba(0,0,0,0.02)] transition-colors">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Xóa hồ sơ này"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
  
                      {confirmDeleteId === item.id && (
                        <div className="absolute right-10 z-40 bg-white border border-gray-200 rounded-lg shadow-xl p-2 flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-150">
                          <span className="text-[12px] font-bold text-gray-700 whitespace-nowrap">Xóa?</span>
                          <button
                            onClick={() => {
                              onDeleteRow(item.id!);
                              setConfirmDeleteId(undefined);
                            }}
                            className="px-1.5 py-0.5 text-[12px] font-bold text-white bg-red-600 rounded hover:bg-red-700 transition"
                          >
                            Có
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(undefined)}
                            className="px-1.5 py-0.5 text-[12px] font-bold text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition"
                          >
                            Không
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FOOTER PHÂN TRANG */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-600 font-medium">
        <div className="flex items-center gap-2">
          <span>Hiển thị:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer bg-white"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>dòng / trang</span>
        </div>

        <div>
          Đang xem <span className="font-bold text-gray-800">{totalItems === 0 ? 0 : startIndex + 1}</span> - <span className="font-bold text-gray-800">{Math.min(startIndex + itemsPerPage, totalItems)}</span> trong tổng số <span className="font-bold text-blue-700">{totalItems}</span> thẻ
        </div>

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

          <span className="px-3 font-bold text-blue-700 bg-blue-50 py-1 rounded border border-blue-100">
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
    </div>
  );
}