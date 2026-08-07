import React from 'react';
import { ArchiveRecord } from '@/shared/lib/db';
import { CheckSquare, Square, Trash2, Download } from 'lucide-react';
import { exportArchivesToExcel } from '../utils/exportArchivesToExcel';

interface ArchiveDataTableProps {
  data: ArchiveRecord[];
  allData: ArchiveRecord[];

  // Pagination
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;

  // Selection
  isSelectMode: boolean;
  setIsSelectMode: (mode: boolean) => void;
  selectedIds: Set<number>;
  toggleSelectCard: (id: number) => void;
  toggleSelectAll: () => void;
  deleteSelected: () => void;
}

export default function ArchiveDataTable({
  data,
  allData,
  currentPage,
  totalPages,
  setCurrentPage,
  isSelectMode,
  setIsSelectMode,
  selectedIds,
  toggleSelectCard,
  toggleSelectAll,
  deleteSelected
}: ArchiveDataTableProps) {

  const handleExport = () => {
    if (selectedIds.size > 0) {
      const selectedData = allData.filter(d => d.id && selectedIds.has(d.id));
      exportArchivesToExcel(selectedData);
    } else {
      exportArchivesToExcel(allData);
    }
  };

  return (
    <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSelectMode(!isSelectMode)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${isSelectMode
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
              }`}
          >
            {isSelectMode ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            {isSelectMode ? 'Tắt chọn' : 'Bật chọn'}
          </button>

          {isSelectMode && selectedIds.size > 0 && (
            <button
              onClick={deleteSelected}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border bg-red-50 text-red-600 border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xoá ({selectedIds.size})
            </button>
          )}
        </div>

        <button
          onClick={handleExport}
          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          {selectedIds.size > 0 ? `Xuất Excel (${selectedIds.size})` : 'Xuất tất cả Excel'}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              {isSelectMode && (
                <th scope="col" className="px-4 py-3 text-left w-10">
                  <button onClick={toggleSelectAll} className="text-gray-500 hover:text-blue-600 transition-colors">
                    {selectedIds.size === data.length && data.length > 0 ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
              )}
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-16">STT</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Số ĐDCN</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Họ và tên</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Giới tính</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ngày sinh</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Số điện thoại</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nơi cư trú</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {data.length === 0 ? (
              <tr>
                <td colSpan={isSelectMode ? 8 : 7} className="px-4 py-8 text-center text-gray-500 italic">
                  Không có dữ liệu trong Tàng thư.
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const isSelected = item.id ? selectedIds.has(item.id) : false;
                return (
                  <tr
                    key={item.id || item.idNumber}
                    className={`hover:bg-blue-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                    onClick={() => isSelectMode && item.id && toggleSelectCard(item.id)}
                  >
                    {isSelectMode && (
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {isSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                      </td>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-gray-900">{item.idNumber}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-blue-700">{item.fullName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{item.gender}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {item.dob?.length === 8
                        ? `${item.dob.substring(0, 2)}-${item.dob.substring(2, 4)}-${item.dob.substring(4, 8)}`
                        : item.dob?.replace(/\//g, '-')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{item.phoneNumber || '-'}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate" title={item.address}>{item.address}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 border-t border-gray-200 gap-3">
          <div className="text-sm text-gray-500">
            Đang xem trang <span className="font-bold text-gray-700">{currentPage}</span> / {totalPages}
          </div>
          <div className="flex gap-1.5 flex-wrap justify-center">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            
            {(() => {
              const pages = [];
              const start = Math.max(1, currentPage - 2);
              const end = Math.min(totalPages, currentPage + 2);

              if (start > 1) {
                pages.push(
                  <button key="1" onClick={() => setCurrentPage(1)} className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-50">1</button>
                );
                if (start > 2) {
                  pages.push(<span key="ellipsis-start" className="px-2 py-1.5 text-gray-500">...</span>);
                }
              }

              for (let i = start; i <= end; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-1.5 border rounded text-sm font-medium ${
                      currentPage === i
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {i}
                  </button>
                );
              }

              if (end < totalPages) {
                if (end < totalPages - 1) {
                  pages.push(<span key="ellipsis-end" className="px-2 py-1.5 text-gray-500">...</span>);
                }
                pages.push(
                  <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-50">{totalPages}</button>
                );
              }

              return pages;
            })()}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
