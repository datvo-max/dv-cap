import React, { useState } from "react";
import { MatchingRecord, CardRecord } from "@/shared/lib/db";
import { ArrowLeft, CheckCircle, Save, ChevronLeft, ChevronRight, Sliders } from "lucide-react";
import SelectFieldsModal from "./SelectFieldsModal";

interface MatchedDataTableProps {
  matchedRecords: MatchingRecord[];
  matchedCardsMap: Record<number, CardRecord>;
  onUpdateField: (matchingId: number, fieldName: keyof MatchingRecord, newValue: string) => void;
  onUpdateAllFields: (matchingId: number) => void;
  onUpdateSelectedFields: (matchingId: number, selectedUpdates: Partial<CardRecord>) => void;
  onResolveMatch: (matchingId: number) => void;
  selectedIds: number[];
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
  onBulkUpdate: (ids: number[]) => void;
  onBulkResolve: (ids: number[]) => void;
}

const formatDateStr = (dateStr?: string) => {
  if (!dateStr) return "-";
  if (dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
    return `${dateStr.slice(0, 2)}-${dateStr.slice(2, 4)}-${dateStr.slice(4)}`;
  }
  return dateStr;
};

const FIELDS_TO_COMPARE: { key: keyof MatchingRecord; label: string }[] = [
  { key: "fullName", label: "Họ Tên" },
  { key: "issueDate", label: "Ngày Cấp" },
  { key: "dob", label: "Ngày Sinh" },
  { key: "address", label: "Địa Chỉ" },
  { key: "fatherName", label: "Tên Cha" },
  { key: "motherName", label: "Tên Mẹ" },
];

export default function MatchedDataTable({
  matchedRecords,
  matchedCardsMap,
  onUpdateField,
  onUpdateAllFields,
  onUpdateSelectedFields,
  onResolveMatch,
  selectedIds,
  setSelectedIds,
  onBulkUpdate,
  onBulkResolve,
}: MatchedDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [activeModalId, setActiveModalId] = useState<number | null>(null);

  if (matchedRecords.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
        <p className="text-gray-500">Chưa có dữ liệu thẻ trùng khớp.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(matchedRecords.length / itemsPerPage);
  const currentRecords = matchedRecords.slice(
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    document.getElementById('matched-table-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div id="matched-table-top" className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 max-h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-500" />
            Đã Tìm Thấy Trong Kho ({matchedRecords.length})
          </h3>
          <div className="text-[11px] text-gray-500 flex flex-wrap items-center gap-3 bg-gray-50 px-2 py-1 rounded-md border border-gray-200 shadow-inner">
            <span className="flex items-center gap-1 font-medium"><Save className="w-3.5 h-3.5 text-blue-600" /> Bổ sung dữ liệu mới</span>
            <span className="flex items-center gap-1 font-medium"><Sliders className="w-3.5 h-3.5 text-amber-600" /> Chọn trường</span>
            <span className="flex items-center gap-1 font-medium"><CheckCircle className="w-3.5 h-3.5 text-gray-500" /> Giữ nguyên không thay đổi</span>
          </div>
        </div>
      </div>

      {/* Thanh công cụ thao tác hàng loạt */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center justify-between mb-4 animate-in fade-in zoom-in-95 duration-200 shrink-0">
          <span className="text-sm font-semibold text-blue-800">
            Đang chọn {selectedIds.length} thẻ
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onBulkUpdate(selectedIds)}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              Bổ sung thông tin hàng loạt
            </button>
            <button
              onClick={() => onBulkResolve(selectedIds)}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5 text-gray-500" />
              Giữ thông tin cũ hàng loạt
            </button>
          </div>
        </div>
      )}

      <div className="overflow-auto flex-1 min-h-0 bg-gray-50/20">
        <table className="w-full text-left text-sm border-collapse bg-white">
          <thead className="sticky top-0 z-30 shadow-sm">
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 border-b border-gray-200 font-semibold w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllCurrentSelected}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="p-3 border-b border-gray-200 font-semibold w-64">Số ĐDCN</th>
              <th className="p-3 border-b border-gray-200 font-semibold bg-blue-50/50">Dữ Liệu Mới (Quét/Excel)</th>
              <th className="p-3 border-b border-gray-200 font-semibold bg-gray-50">Dữ Liệu Kho Hiện Tại</th>
              <th className="p-3 border-b border-gray-200 font-semibold sticky right-0 bg-gray-100 z-40 border-l text-right shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((record) => {
              const oldCard = matchedCardsMap[record.matchedCardId!];
              if (!oldCard) return null;

              const isSelected = selectedIds.includes(record.id!);

              return (
                <tr key={record.id} className={`border-b border-gray-100 bg-white hover:bg-blue-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                  <td className="p-3 align-top text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(record.id!)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-3 align-top">
                    <p className="font-bold text-gray-900">{record.idNumber}</p>
                    <p className="text-gray-500 text-xs">Vị trí: Hộp {oldCard.zone}</p>
                  </td>

                  {/* Dữ liệu Mới */}
                  <td className="p-3 align-top bg-blue-50/20">
                    <div className="space-y-1">
                      {FIELDS_TO_COMPARE.map(({ key, label }) => {
                        const newVal = record[key] as string | undefined;
                        const oldVal = oldCard[key as keyof CardRecord] as string | undefined;
                        const isDiff = newVal !== oldVal && newVal && newVal !== "-";

                        const displayNewVal = (key === 'dob' || key === 'issueDate') ? formatDateStr(newVal) : newVal;

                        return (
                          <div key={key} className={`flex text-xs ${isDiff ? 'font-medium text-blue-700' : 'text-gray-500'}`}>
                            <span className="w-20 inline-block text-gray-400">{label}:</span>
                            <span>{displayNewVal}</span>
                          </div>
                        );
                      })}
                    </div>
                  </td>

                  {/* Dữ liệu Kho */}
                  <td className="p-3 align-top bg-gray-50/50">
                    <div className="space-y-1">
                      {FIELDS_TO_COMPARE.map(({ key, label }) => {
                        const newVal = record[key] as string | undefined;
                        const oldVal = oldCard[key as keyof CardRecord] as string | undefined;
                        const isDiff = newVal !== oldVal && newVal && newVal !== "-";

                        const displayOldVal = (key === 'dob' || key === 'issueDate') ? formatDateStr(oldVal) : (oldVal || "-");

                        return (
                          <div key={key} className={`flex text-xs ${isDiff ? 'font-medium text-gray-900 bg-yellow-100 px-1 rounded' : 'text-gray-600'}`}>
                            <span className="w-20 inline-block text-gray-400">{label}:</span>
                            <span>{displayOldVal}</span>
                          </div>
                        );
                      })}
                    </div>
                  </td>

                  <td className="p-3 align-middle text-right sticky right-0 bg-inherit border-l border-gray-100 z-10">
                    <div className="flex gap-2 justify-end items-center h-full">
                      <button
                        onClick={() => onUpdateAllFields(record.id!)}
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors shadow-sm"
                        title="Bổ sung toàn bộ thông tin mới"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveModalId(record.id!)}
                        className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors shadow-sm"
                        title="Chọn trường thông tin muốn cập nhật"
                      >
                        <Sliders className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onResolveMatch(record.id!)}
                        className="p-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
                        title="Giữ toàn bộ thông tin cũ"
                      >
                        <CheckCircle className="w-4 h-4 text-gray-500" />
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
            Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-medium">{Math.min(currentPage * itemsPerPage, matchedRecords.length)}</span> trong số <span className="font-medium">{matchedRecords.length}</span> thẻ
          </p>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-sm border border-gray-300 rounded-md py-1 px-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      <SelectFieldsModal
        isOpen={activeModalId !== null}
        onClose={() => setActiveModalId(null)}
        matchingRecord={matchedRecords.find(r => r.id === activeModalId) || null}
        oldCard={activeModalId !== null ? (matchedCardsMap[matchedRecords.find(r => r.id === activeModalId)?.matchedCardId || 0] || null) : null}
        onConfirm={onUpdateSelectedFields}
      />
    </div>
  );
}
