import React, { useRef } from "react";
import { useMatchingApp } from "../hooks/useMatchingApp";
import MatchedDataTable from "./MatchedDataTable";
import UnmatchedDataTable from "./UnmatchedDataTable";
import MatchingScannerSection from "./MatchingScannerSection";
import { Upload, Camera, Trash2, ListChecks } from "lucide-react";
import Toast from "@/shared/components/Toast";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { useState } from "react";

export default function MatchingDashboard() {
  const matchApp = useMatchingApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-[1700px] mx-auto">

      {/* Scanner Section */}
      <MatchingScannerSection
        isWebCamActive={matchApp.isWebCamActive}
        isFlashActive={matchApp.isFlashActive}
        onStopWebcam={matchApp.stopWebcam}
      />

      <div className={matchApp.isWebCamActive ? 'hidden' : 'block'}>
        <div className="flex flex-col lg:flex-row gap-6 items-start mt-6">

          {/* CỘT TRÁI: Bảng Điều Khiển */}
          <div className="w-full lg:w-1/4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm lg:sticky lg:top-24 flex flex-col gap-5">
            <div className={`flex items-center gap-3 border-b pb-3 transition-opacity duration-300 ${isFocused ? 'opacity-30' : 'opacity-100'}`}>
               <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                  <ListChecks className="text-indigo-600 w-5 h-5" />
               </div>
               <div>
                 <h2 className="text-base font-bold text-gray-800">Bảng Điều Khiển</h2>
                 <p className="text-xs text-gray-500">Đối sánh dữ liệu</p>
               </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full">
              <div className={`transition-opacity duration-300 ${isFocused ? 'opacity-30' : 'opacity-100'}`}>
                <button
                  onClick={handleUploadClick}
                  className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Nạp File Excel
                </button>
              </div>

              {/* Input Máy quét vật lý */}
              <div className={`relative p-[1.5px] rounded-lg transition-all duration-300 ${isFocused ? 'overflow-hidden shadow-lg' : 'border border-indigo-200 bg-gray-50'}`}>
                {isFocused && (
                  <div className="absolute w-[150%] aspect-square top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,#ff453a,#ff9f0a,#30d158,#0a84ff,#bf5af2,#ff453a)] animate-[spin_3.5s_linear_infinite]" />
                )}
                <div className="relative bg-white rounded-[7px] z-10 flex flex-col p-1">
                  <textarea
                    rows={3}
                    placeholder={isFocused ? "Đang đợi dữ liệu từ máy quét..." : "Nhấp vào đây để quét mã..."}
                    onKeyDown={matchApp.handleScannerInput}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full px-2 py-1.5 focus:outline-none text-sm break-all resize-none bg-transparent font-medium text-indigo-900 placeholder:text-gray-400"
                    title="Nạp lẻ bằng máy quét phần cứng"
                  />
                </div>
              </div>

              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                ref={fileInputRef}
                onChange={matchApp.handleImportExcel}
              />

              <div className={`flex flex-col gap-3 transition-opacity duration-300 ${isFocused ? 'opacity-30' : 'opacity-100'}`}>
                <button
                  onClick={matchApp.startWebcam}
                  className="w-full px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Mở Camera
                </button>
                
                <div className="h-px bg-gray-200 my-1 w-full"></div>
                
                <button
                  onClick={matchApp.clearAllResolved}
                  className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  Dọn thẻ đã xử lý
                </button>
                <button
                  onClick={() => setIsConfirmClearOpen(true)}
                  className="w-full px-4 py-2.5 bg-red-50 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors shadow-sm flex items-center justify-center gap-2 border border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa Phiên
                </button>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Bảng Dữ Liệu */}
          <div className="w-full lg:w-3/4 flex flex-col gap-6">
            <MatchedDataTable
              matchedRecords={matchApp.matchedRecords.filter(r => r.status === 'matched')}
              matchedCardsMap={matchApp.matchedCardsMap}
              onUpdateField={matchApp.updateField}
              onUpdateAllFields={matchApp.updateAllFields}
              onUpdateSelectedFields={matchApp.updateSelectedFields}
              onResolveMatch={matchApp.resolveMatch}
              selectedIds={matchApp.selectedMatchedIds}
              setSelectedIds={matchApp.setSelectedMatchedIds}
              onBulkUpdate={matchApp.bulkUpdateAllFields}
              onBulkResolve={matchApp.bulkResolveMatch}
            />

            <UnmatchedDataTable
              unmatchedRecords={matchApp.unmatchedRecords.filter(r => r.status === 'unmatched')}
              onAddToWarehouse={matchApp.addToWarehouse}
              onIgnoreRecord={matchApp.ignoreRecord}
              selectedIds={matchApp.selectedUnmatchedIds}
              setSelectedIds={matchApp.setSelectedUnmatchedIds}
              onBulkAdd={matchApp.bulkAddToWarehouse}
              onBulkIgnore={matchApp.bulkIgnore}
            />
          </div>
        </div>
      </div>

      <Toast toasts={matchApp.toasts} progress={null} />

      <ConfirmModal
        isOpen={isConfirmClearOpen}
        title="Xóa Phiên Đối Sánh"
        message="Bạn có chắc chắn muốn xóa toàn bộ danh sách thẻ đang đối sánh hiện tại? (Dữ liệu thẻ gốc trong Kho sẽ không bị ảnh hưởng)"
        onConfirm={() => {
          matchApp.clearAll();
          setIsConfirmClearOpen(false);
        }}
        onCancel={() => setIsConfirmClearOpen(false)}
      />
    </div>
  );
}
