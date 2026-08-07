import React, { useState } from "react";
import { MatchingRecord } from "@/shared/lib/db";
import { AlertCircle, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import PromptModal from "@/shared/components/PromptModal";

interface UnmatchedDataTableProps {
  unmatchedRecords: MatchingRecord[];
  onAddToWarehouse: (matchingId: number, zone: string | number) => void;
  onIgnoreRecord: (matchingId: number) => void;
  selectedIds: number[];
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
  onBulkAdd: (ids: number[], zone: string | number) => void;
  onBulkIgnore: (ids: number[]) => void;
}

const formatDateStr = (dateStr?: string) => {
  if (!dateStr) return "-";
  if (dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
    return `${dateStr.slice(0, 2)}-${dateStr.slice(2, 4)}-${dateStr.slice(4)}`;
  }
  return dateStr;
};

export default function UnmatchedDataTable({
  unmatchedRecords,
  onAddToWarehouse,
  onIgnoreRecord,
  selectedIds,
  setSelectedIds,
  onBulkAdd,
  onBulkIgnore,
}: UnmatchedDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [promptConfig, setPromptConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (val: string) => void;
  } | null>(null);

  if (unmatchedRecords.length === 0) return null;

  const totalPages = Math.ceil(unmatchedRecords.length / itemsPerPage);
  const currentRecords = unmatchedRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const currentPageIds = currentRecords.map((r) => r.id!);
  const isAllCurrentSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (isAllCurrentSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      const newIds = [...selectedIds];
      currentPageIds.forEach((id) => {
        if (!newIds.includes(id)) newIds.push(id);
      });
      setSelectedIds(newIds);
    }
  };

  const handleAdd = (id: number) => {
    setPromptConfig({
      isOpen: true,
      title: "Thêm vào Kho",
      message: "Nhập Vị trí Hộp để lưu thẻ này (VD: 1, K1):",
      onConfirm: (zone) => {
        onAddToWarehouse(id, zone);
        setPromptConfig(null);
      }
    });
  };

  const handleBulkAdd = () => {
    setPromptConfig({
      isOpen: true,
      title: "Thêm Hàng Loạt",
      message: "Nhập Vị trí Hộp chung để lưu các thẻ này (VD: 1, K1):",
      onConfirm: (zone) => {
        onBulkAdd(selectedIds, zone);
        setPromptConfig(null);
      }
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    document.getElementById('unmatched-table-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div id="unmatched-table-top" className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6 max-h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Chưa Có Trong Kho ({unmatchedRecords.length})
          </h3>
          <div className="text-[11px] text-gray-500 flex items-center gap-3 bg-gray-50 px-2 py-1 rounded-md border border-gray-200 shadow-inner">
            <span className="flex items-center gap-1 font-medium"><Plus className="w-3.5 h-3.5 text-blue-600"/> Thêm vào kho</span>
            <span className="flex items-center gap-1 font-medium"><Trash2 className="w-3.5 h-3.5 text-red-600"/> Bỏ qua</span>
          </div>
        </div>
      </div>
      
      {/* Thanh công cụ thao tác hàng loạt */}
      {selectedIds.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg flex items-center justify-between mb-4 animate-in fade-in zoom-in-95 duration-200 shrink-0">
          <span className="text-sm font-semibold text-orange-800">
            Đang chọn {selectedIds.length} thẻ
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkAdd}
              className="px-3 py-1.5 bg-orange-600 text-white text-xs font-semibold rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm vào kho hàng loạt
            </button>
            <button
              onClick={() => onBulkIgnore(selectedIds)}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-500" />
              Bỏ qua hàng loạt
            </button>
          </div>
        </div>
      )}

      <div className="overflow-auto flex-1 min-h-0 bg-gray-50/20">
        <table className="w-full text-left text-sm border-collapse bg-white">
          <thead className="sticky top-0 z-30 shadow-sm">
            <tr className="bg-gray-100 text-gray-700 whitespace-nowrap">
              <th className="p-3 border-b border-gray-200 font-semibold w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllCurrentSelected}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
                />
              </th>
              <th className="p-3 border-b border-gray-200 font-semibold">CCCD</th>
              <th className="p-3 border-b border-gray-200 font-semibold">Họ và Tên</th>
              <th className="p-3 border-b border-gray-200 font-semibold">Ngày Sinh</th>
              <th className="p-3 border-b border-gray-200 font-semibold">Ngày Cấp</th>
              <th className="p-3 border-b border-gray-200 font-semibold">Địa Chỉ</th>
              <th className="p-3 border-b border-gray-200 font-semibold">Họ Tên Cha / Mẹ</th>
              <th className="p-3 border-b border-gray-200 font-semibold sticky right-0 bg-gray-100 z-40 border-l text-right shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((record) => {
              const isSelected = selectedIds.includes(record.id!);
              return (
              <tr key={record.id} className={`border-b border-gray-100 bg-white hover:bg-orange-50 transition-colors ${isSelected ? 'bg-orange-50' : ''}`}>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(record.id!)}
                    className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
                  />
                </td>
                <td className="p-3 font-medium text-gray-900 whitespace-nowrap">{record.idNumber}</td>
                <td className="p-3 text-gray-700 whitespace-nowrap">{record.fullName}</td>
                <td className="p-3 text-gray-600 whitespace-nowrap">{formatDateStr(record.dob)}</td>
                <td className="p-3 text-gray-600 whitespace-nowrap">{formatDateStr(record.issueDate)}</td>
                <td className="p-3 text-gray-600 max-w-xs truncate" title={record.address}>{record.address || "-"}</td>
                <td className="p-3 text-gray-600 text-xs">
                  <div>C: {record.fatherName || "-"}</div>
                  <div>M: {record.motherName || "-"}</div>
                </td>
                <td className="p-3 align-middle text-right sticky right-0 bg-inherit border-l border-gray-100 z-10">
                  <div className="flex justify-end gap-2 items-center h-full">
                    <button
                      onClick={() => handleAdd(record.id!)}
                      className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors shadow-sm"
                      title="Thêm thẻ này vào kho"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onIgnoreRecord(record.id!)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors shadow-sm"
                      title="Bỏ qua và xóa khỏi danh sách đối sánh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Phân trang */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 px-4 py-3 bg-gray-50/50 gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">
            Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-medium">{Math.min(currentPage * itemsPerPage, unmatchedRecords.length)}</span> trong số <span className="font-medium">{unmatchedRecords.length}</span> thẻ
          </p>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-sm border border-gray-300 rounded-md py-1 px-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {[10, 20, 50, 100, 200].map(size => (
              <option key={size} value={size}>{size} / trang</option>
            ))}
          </select>
        </div>
        
        {totalPages > 1 && (
          <div className="flex gap-1">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 text-sm font-medium text-gray-700">
              Trang {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {promptConfig && (
        <PromptModal
          isOpen={promptConfig.isOpen}
          title={promptConfig.title}
          message={promptConfig.message}
          defaultValue="1"
          onConfirm={promptConfig.onConfirm}
          onCancel={() => setPromptConfig(null)}
        />
      )}
    </div>
  );
}
