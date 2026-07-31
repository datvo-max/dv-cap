"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { db } from "@/shared/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { removeVietnameseTones } from "@/shared/utils/removeVietnameseTones";

// Components con
import ReturnDataToolbar from "./table/ReturnDataToolbar";
import ReturnDataBulkActions from "./table/ReturnDataBulkActions";
import ReturnDataLegend from "./table/ReturnDataLegend";
import ReturnDataPagination from "./table/ReturnDataPagination";
import ReturnDataTableRow from "./table/ReturnDataTableRow";

interface ReturnDataTableProps {
  onReturnCard: (id: number) => void;
  onUndoReturn: (id: number) => void;
  onEditCard: (id: number) => void;
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

  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterIdNumber, setFilterIdNumber] = useState("");
  const [filterBirthYear, setFilterBirthYear] = useState("");
  const [filterFather, setFilterFather] = useState("");
  const [filterMother, setFilterMother] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [prevSearchTerm, setPrevSearchTerm] = useState(debouncedSearchTerm);
  if (debouncedSearchTerm !== prevSearchTerm) {
    setPrevSearchTerm(debouncedSearchTerm);
    setCurrentPage(1);
  }

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

  const allCards = useLiveQuery(() => db.cards.orderBy('zone').toArray());

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

    const searchTerms = debouncedSearchTerm.split('|').map(t => removeVietnameseTones(t.toLowerCase().trim())).filter(t => t.length > 0);

    return result.filter(item => {
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

      return searchTerms.every(term => {
         if (term.startsWith("hop ")) {
            return item.zone.toString().toLowerCase() === term.replace("hop ", "").trim();
         }
         return combinedString.includes(term);
      });
    });
  }, [allCards, debouncedSearchTerm, filterStatus, filterIdNumber, filterBirthYear, filterFather, filterMother]);

  const selectedCards = useMemo(() => {
    if (!allCards) return [];
    return allCards.filter(c => c.id !== undefined && selectedIds.has(c.id));
  }, [allCards, selectedIds]);

  const hasShippingSelected = selectedCards.some(c => c.status === 'shipping');
  const hasShippedOrReturnedSelected = selectedCards.some(c => c.status === 'shipping' || c.status === 'returned');

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div ref={tableTopRef} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full flex flex-col">
      <ReturnDataToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchInputRef={searchInputRef}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        isSelectMode={isSelectMode}
        onToggleSelectMode={onToggleSelectMode}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterIdNumber={filterIdNumber}
        setFilterIdNumber={setFilterIdNumber}
        filterBirthYear={filterBirthYear}
        setFilterBirthYear={setFilterBirthYear}
        filterFather={filterFather}
        setFilterFather={setFilterFather}
        filterMother={filterMother}
        setFilterMother={setFilterMother}
      />

      <ReturnDataBulkActions
        selectedIdsSize={selectedIds.size}
        onOpenExportModal={onOpenExportModal}
        onOpenMoveBoxModal={onOpenMoveBoxModal}
        onAssignShipper={onAssignShipper}
        hasShippingSelected={hasShippingSelected}
        onBulkConfirmDelivered={onBulkConfirmDelivered}
        hasShippedOrReturnedSelected={hasShippedOrReturnedSelected}
        onBulkReturnToWarehouse={onBulkReturnToWarehouse}
        onClearSelection={onClearSelection}
      />

      <ReturnDataLegend />

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
              paginatedData.map((item, index) => (
                <ReturnDataTableRow
                  key={item.id}
                  item={item}
                  actualIndex={startIndex + index + 1}
                  isSelectMode={isSelectMode}
                  isSelected={item.id !== undefined && selectedIds.has(item.id)}
                  onToggleSelectCard={onToggleSelectCard}
                  onReturnCard={onReturnCard}
                  onUndoReturn={onUndoReturn}
                  onEditCard={onEditCard}
                  imageCount={item.id !== undefined ? (imageCountMap.get(item.id) || 0) : 0}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <ReturnDataPagination
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        setCurrentPage={setCurrentPage}
        totalItems={totalItems}
        startIndex={startIndex}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}