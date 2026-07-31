import React from "react";

interface ReturnDataBulkActionsProps {
  selectedIdsSize: number;
  onOpenExportModal: (type: 'all' | 'returned' | 'pending' | 'selected') => void;
  onOpenMoveBoxModal: () => void;
  onAssignShipper: () => void;
  hasShippingSelected: boolean;
  onBulkConfirmDelivered: () => void;
  hasShippedOrReturnedSelected: boolean;
  onBulkReturnToWarehouse: () => void;
  onClearSelection: () => void;
}

export default function ReturnDataBulkActions({
  selectedIdsSize,
  onOpenExportModal,
  onOpenMoveBoxModal,
  onAssignShipper,
  hasShippingSelected,
  onBulkConfirmDelivered,
  hasShippedOrReturnedSelected,
  onBulkReturnToWarehouse,
  onClearSelection
}: ReturnDataBulkActionsProps) {
  if (selectedIdsSize === 0) return null;

  return (
    <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-1 duration-200">
      <div className="flex items-center gap-2 text-xs text-indigo-900 font-bold">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">
          {selectedIdsSize}
        </span>
        <span>Đã chọn {selectedIdsSize} thẻ</span>
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
  );
}
