"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { db } from "@/shared/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { removeVietnameseTones } from "@/shared/utils/removeVietnameseTones";
import { CheckCircle, Truck, Archive, Phone, Image } from "lucide-react";

interface ReturnDataTableProps {
  onReturnCard: (idNumber: string) => void;
  onUndoReturn: (id: number) => void;
  onEditCard: (id: number) => void; // MỚI: Thêm prop gọi Modal sửa
  // MỚI: Thêm các prop phục vụ chọn hàng loạt và Shipper
  selectedIds: Set<number>;
  isSelectMode: boolean;
  onToggleSelectMode: (val: boolean) => void;
  onToggleSelectCard: (id: number) => void;
  onToggleSelectAll: (displayedIds: number[]) => void;
  onClearSelection: () => void;
  onAssignShipper: () => void;
  onOpenMoveBoxModal: () => void;
  onBulkConfirmDelivered: () => void;
  onBulkReturnToWarehouse: () => void;
  onOpenExportModal: (type: 'all' | 'returned' | 'pending' | 'selected') => void;
}

export default function ReturnDataTable({
  onReturnCard,
  onUndoReturn,
  onEditCard,
  selectedIds,
  isSelectMode,
  onToggleSelectMode,
  onToggleSelectCard,
  onToggleSelectAll,
  onClearSelection,
  onAssignShipper,
  onOpenMoveBoxModal,
  onBulkConfirmDelivered,
  onBulkReturnToWarehouse,
  onOpenExportModal
}: ReturnDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- STATE BỘ LỌC NÂNG CAO ---
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterIdNumber, setFilterIdNumber] = useState("");
  const [filterBirthYear, setFilterBirthYear] = useState("");
  const [filterFather, setFilterFather] = useState("");
  const [filterMother, setFilterMother] = useState("");

  // --- STATE QUẢN LÝ PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Reset về trang 1 mỗi khi người dùng gõ từ khóa tìm kiếm mới (Tránh dùng useEffect setState)
  const [prevSearchTerm, setPrevSearchTerm] = useState(debouncedSearchTerm);
  if (debouncedSearchTerm !== prevSearchTerm) {
    setPrevSearchTerm(debouncedSearchTerm);
    setCurrentPage(1);
  }

  // =====================================
  // MỚI: TẠO CỘT MỐC VÀ HIỆU ỨNG CUỘN
  // =====================================
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
  // =====================================

  const allCards = useLiveQuery(() => db.cards.orderBy('zone').toArray());

  // MỚI: Truy vấn nhanh danh sách key (cardId) từ bảng ảnh để đếm số lượng ảnh của mỗi thẻ mà không cần load dữ liệu Base64
  const imageCountMap = useLiveQuery(async () => {
    const keys = await db.cardImages.orderBy('cardId').keys();
    const map = new Map<number, number>();
    for (const key of keys) {
      const cardId = Number(key);
      if (!isNaN(cardId)) {
        map.set(cardId, (map.get(cardId) || 0) + 1);
      }
    }
    return map;
  }, []) || new Map<number, number>();

  const filteredData = useMemo(() => {
    if (!allCards) return [];
    
    // 1. Áp dụng bộ lọc nâng cao trước
    let result = allCards;
    if (filterStatus !== "all") {
      result = result.filter(c => c.status === filterStatus);
    }
    if (filterIdNumber.trim()) {
      result = result.filter(c => c.idNumber.includes(filterIdNumber.trim()));
    }
    if (filterBirthYear.trim()) {
      result = result.filter(c => {
        if (!c.dob) return false;
        // Lấy 4 số cuối của Ngày Sinh (dd/mm/yyyy -> yyyy)
        const match = c.dob.match(/\d{4}$/);
        return match && match[0] === filterBirthYear.trim();
      });
    }
    if (filterFather.trim()) {
      const normalizedFilter = removeVietnameseTones(filterFather.toLowerCase().trim());
      result = result.filter(c => c.fatherName && removeVietnameseTones(c.fatherName.toLowerCase()).includes(normalizedFilter));
    }
    if (filterMother.trim()) {
      const normalizedFilter = removeVietnameseTones(filterMother.toLowerCase().trim());
      result = result.filter(c => c.motherName && removeVietnameseTones(c.motherName.toLowerCase()).includes(normalizedFilter));
    }

    if (!debouncedSearchTerm) return result;

    // 2. Xử lý tìm kiếm bằng Text tự do (Hỗ trợ phân tách bằng dấu | cho điều kiện AND)
    const searchTerms = debouncedSearchTerm.split('|').map(t => removeVietnameseTones(t.toLowerCase().trim())).filter(t => t.length > 0);

    return result.filter(item => {
      // Gom tất cả các trường có thể tìm kiếm thành 1 chuỗi khổng lồ
      const combinedString = [
        item.fullName,
        item.idNumber,
        item.phoneNumber,
        item.shipperName,
        item.shipperPhone,
        item.address,
        item.fatherName,
        item.motherName,
        item.zone.toString()
      ].filter(Boolean).map(s => removeVietnameseTones(String(s).toLowerCase())).join(" ");

      // Phải chứa TẤT CẢ các từ khoá (AND)
      return searchTerms.every(term => {
         // Đặc trị tìm hộp
         if (term.startsWith("hop ")) {
            return item.zone.toString().toLowerCase() === term.replace("hop ", "").trim();
         }
         return combinedString.includes(term);
      });
    });
  }, [allCards, debouncedSearchTerm, filterStatus, filterIdNumber, filterBirthYear, filterFather, filterMother]);

  // MỚI: Tính toán các thẻ được chọn trong danh sách allCards
  const selectedCards = useMemo(() => {
    if (!allCards) return [];
    return allCards.filter(c => c.id !== undefined && selectedIds.has(c.id));
  }, [allCards, selectedIds]);

  const hasShippingSelected = selectedCards.some(c => c.status === 'shipping');
  const hasShippedOrReturnedSelected = selectedCards.some(c => c.status === 'shipping' || c.status === 'returned');

  // 2. Tính toán các thông số phân trang
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  // 3. Cắt mảng dữ liệu để chỉ hiển thị đúng số dòng của trang hiện tại
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div ref={tableTopRef} className="bg-white rounded-xl shadow-sm border overflow-hidden w-full flex flex-col">
      {/* THANH TÌM KIẾM VÀ BỘ LỌC */}
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

        {/* BỘ LỌC NÂNG CAO */}
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

      {/* THANH HÀNH ĐỘNG HÀNG LOẠT */}
      {selectedIds.size > 0 && (
        <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2 text-xs text-indigo-900 font-bold">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">
              {selectedIds.size}
            </span>
            <span>Đã chọn {selectedIds.size} thẻ</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onOpenExportModal('selected')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Xuất Excel
            </button>
            <button
              onClick={onOpenMoveBoxModal}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
              Chuyển hộp
            </button>
            <button
              onClick={onAssignShipper}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[11px] font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Chuyển Shipper
            </button>
            {hasShippingSelected && (
              <button
                onClick={onBulkConfirmDelivered}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-[11px] font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Xác nhận đã giao
              </button>
            )}
            {hasShippedOrReturnedSelected && (
              <button
                onClick={onBulkReturnToWarehouse}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-[11px] font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                Trả lại kho
              </button>
            )}
            <button
              onClick={onClearSelection}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-[11px] font-bold shadow-sm transition-all cursor-pointer"
            >
              Hủy chọn
            </button>
          </div>
        </div>
      )}

      {/* CHÚ THÍCH KÝ HIỆU TRẠNG THÁI (LEGEND) */}
      <div className="px-4 py-2.5 bg-gray-50/90 border-b border-gray-200 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-gray-600">
        <span className="font-bold text-gray-700 flex items-center gap-1">
          💡 Chú thích trạng thái:
        </span>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="flex items-center gap-1 font-medium" title="Thẻ đã được bàn giao cho công dân">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline" /> Đã trả
          </span>
          <span className="flex items-center gap-1 font-medium" title="Thẻ đang được giao bởi shipper">
            <Truck className="w-3.5 h-3.5 text-amber-600 inline" /> Đang giao
          </span>
          <span className="flex items-center gap-1 font-medium" title="Thẻ vẫn đang lưu trong kho">
            <Archive className="w-3.5 h-3.5 text-indigo-600 inline" /> Trong kho
          </span>
        </div>
        <span className="text-gray-300">|</span>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="flex items-center gap-1 font-medium" title="Đã có số điện thoại liên hệ">
            <Phone className="w-3.5 h-3.5 text-blue-600 inline" /> Có SĐT
          </span>
          <span className="flex items-center gap-1 font-medium" title="Chưa có số điện thoại liên hệ">
            <Phone className="w-3.5 h-3.5 text-gray-300 inline" /> Chưa SĐT
          </span>
        </div>
        <span className="text-gray-300">|</span>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="flex items-center gap-1 font-medium" title="Chưa có ảnh đính kèm (0/4)">
            <Image className="w-3.5 h-3.5 text-gray-300 inline" /> 0 ảnh
          </span>
          <span className="flex items-center gap-1 font-medium" title="Đã có từ 1 đến 3 ảnh đính kèm">
            <Image className="w-3.5 h-3.5 text-amber-500 inline" /> 1-3 ảnh
          </span>
          <span className="flex items-center gap-1 font-medium" title="Đã có đủ 4 ảnh đính kèm">
            <Image className="w-3.5 h-3.5 text-emerald-600 inline" /> Đủ 4 ảnh
          </span>
        </div>
      </div>

      <div className="overflow-x-auto min-h-100">
        <table className="w-full text-xs text-left border-collapse text-gray-600 whitespace-nowrap relative">
          <thead className="bg-gray-100 text-gray-700 font-bold stick z-10 shadow-sm">
            <tr>
              {isSelectMode && (
                <th className="px-3 py-3 text-center w-10 border-b border-gray-200">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && paginatedData.every(item => item.id !== undefined && selectedIds.has(item.id))}
                    onChange={() => onToggleSelectAll(paginatedData.map(item => item.id).filter((id): id is number => id !== undefined))}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
              )}
              <th className="px-3 py-3 text-center w-12 border-b border-gray-200">STT</th>
              <th className="px-3 py-3 border-b border-gray-200">Vị trí</th>
              <th className="px-3 py-3 text-center border-b border-gray-200">Trạng thái</th>
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
                <td colSpan={isSelectMode ? 12 : 11} className="text-center py-16 text-gray-400">
                  {searchTerm ? "Không tìm thấy hồ sơ nào khớp với từ khóa." : "Kho thẻ hiện đang trống. Vui lòng nạp dữ liệu từ Excel."}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => {
                const isReturned = item.status === 'returned';
                // Tính lại số thứ tự (STT) dựa trên số trang
                const actualIndex = startIndex + index + 1;

                return (
                  <tr key={item.id} className={`transition-colors ${isReturned ? 'bg-gray-50 opacity-60' : 'hover:bg-indigo-50/40'} ${item.id !== undefined && selectedIds.has(item.id) ? 'bg-indigo-50/30' : ''}`}>
                    {isSelectMode && (
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={item.id !== undefined && selectedIds.has(item.id)}
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
                          const count = item.id ? (imageCountMap.get(item.id) || 0) : 0;
                          let iconColor = "text-gray-300";
                          if (count >= 4) iconColor = "text-emerald-600";
                          else if (count > 0) iconColor = "text-amber-500";
                          return (
                            <span
                              title={`Ảnh đính kèm: ${count}/4 ảnh`}
                              className={`flex items-center font-bold text-[10px] cursor-help ${iconColor}`}
                            >
                              <Image className="w-4 h-4" />
                              {count > 0 && count < 4 && (
                                <span className="ml-0.5 text-[9px] leading-none">{count}</span>
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
                        {/* MỚI: Hiển thị badge nhỏ nếu thẻ không ảnh */}
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
                            onClick={() => onReturnCard(item.idNumber)}
                            className="px-3 py-1 bg-green-500 text-white text-[10px] font-bold rounded-md shadow-sm hover:bg-green-600 hover:shadow transform hover:scale-105 transition-all cursor-pointer"
                            title="Xác nhận đã trả thẻ này cho công dân"
                          >
                            Xác nhận trả
                          </button>
                        )}
                        {item.status === 'shipping' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => onReturnCard(item.idNumber)}
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