import React from 'react';
import { Search } from 'lucide-react';

interface ArchiveAdvancedSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalRecords: number;
}

export default function ArchiveAdvancedSearch({
  searchTerm,
  setSearchTerm,
  pageSize,
  setPageSize,
  totalRecords
}: ArchiveAdvancedSearchProps) {
  return (
    <div className="bg-white p-3 rounded-t-xl border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-3">
      <div className="relative w-full md:w-1/2 lg:w-1/3">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Lọc trong danh sách (ĐDCN, Họ tên...)"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-4 text-sm w-full md:w-auto justify-between md:justify-end">
        <div className="text-gray-600 font-medium">
          Tổng: <span className="text-blue-700 font-bold">{totalRecords}</span> hồ sơ
        </div>
        <div className="flex items-center gap-2">
          <label className="text-gray-500">Hiển thị:</label>
          <select
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </div>
  );
}
