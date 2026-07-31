import React from "react";

interface ReturnDataToolbarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  showFilters: boolean;
  setShowFilters: (val: boolean) => void;
  isSelectMode: boolean;
  onToggleSelectMode: (val: boolean) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterIdNumber: string;
  setFilterIdNumber: (val: string) => void;
  filterBirthYear: string;
  setFilterBirthYear: (val: string) => void;
  filterFather: string;
  setFilterFather: (val: string) => void;
  filterMother: string;
  setFilterMother: (val: string) => void;
}

export default function ReturnDataToolbar({
  searchTerm,
  setSearchTerm,
  searchInputRef,
  showFilters,
  setShowFilters,
  isSelectMode,
  onToggleSelectMode,
  filterStatus,
  setFilterStatus,
  filterIdNumber,
  setFilterIdNumber,
  filterBirthYear,
  setFilterBirthYear,
  filterFather,
  setFilterFather,
  filterMother,
  setFilterMother
}: ReturnDataToolbarProps) {
  return (
    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-3">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full flex items-center">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Tìm nhiều từ khoá với dấu | (VD: 092 | Võ)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white font-medium"
          />
          {searchTerm && (
            <button onClick={() => {
              setSearchTerm("");
              searchInputRef.current?.focus();
            }} className="absolute right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          )}
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${showFilters ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            Bộ lọc
          </button>
          <button
            onClick={() => onToggleSelectMode(!isSelectMode)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer flex-1 md:flex-none ${isSelectMode
                ? "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            {isSelectMode ? "Tắt chế độ chọn" : "Mở chế độ chọn"}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-gray-200 mt-1 animate-in slide-in-from-top-2">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Trạng thái</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white font-medium text-gray-700 outline-none focus:ring-1 focus:ring-blue-500">
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chưa trả</option>
              <option value="shipping">Đang giao</option>
              <option value="returned">Đã trả</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Số CCCD</label>
            <input type="text" value={filterIdNumber} onChange={e => setFilterIdNumber(e.target.value)} placeholder="Nhập số..." className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Năm sinh</label>
            <input type="text" value={filterBirthYear} onChange={e => setFilterBirthYear(e.target.value)} placeholder="VD: 1990" maxLength={4} className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tên Cha</label>
            <input type="text" value={filterFather} onChange={e => setFilterFather(e.target.value)} placeholder="Tìm tên..." className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tên Mẹ</label>
            <input type="text" value={filterMother} onChange={e => setFilterMother(e.target.value)} placeholder="Tìm tên..." className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium" />
          </div>
        </div>
      )}
    </div>
  );
}
