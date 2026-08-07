import React, { useRef } from "react";
import { useMatchingApp } from "../hooks/useMatchingApp";
import MatchedDataTable from "./MatchedDataTable";
import UnmatchedDataTable from "./UnmatchedDataTable";
import MatchingScannerSection from "./MatchingScannerSection";
import DuplicateDataTable from "./DuplicateDataTable";
import { Upload, Camera, Trash2, ListChecks, FileWarning, Settings2, X, Barcode } from "lucide-react";
import Toast from "@/shared/components/Toast";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function MatchingDashboard() {
  const matchApp = useMatchingApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [isDeviceScannerActive, setIsDeviceScannerActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            <div className="flex flex-col gap-3 w-full">
              <div className={`transition-opacity duration-300 ${isFocused ? 'opacity-30' : 'opacity-100'}`}>
                <button
                  onClick={() => setIsToolsModalOpen(true)}
                  className="w-full px-4 py-3 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Settings2 className="w-5 h-5" />
                  Công cụ đối sánh
                </button>
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
                  onClick={() => setShowDuplicates(!showDuplicates)}
                  className={`w-full px-4 py-3 text-sm font-semibold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 border ${showDuplicates
                      ? "bg-amber-600 text-white border-amber-700"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                    }`}
                >
                  <FileWarning className="w-4 h-4" />
                  {showDuplicates ? "Đóng Quét trùng" : "Quét dữ liệu nghi trùng"}
                </button>
                <button
                  onClick={() => setIsConfirmClearOpen(true)}
                  className="w-full px-4 py-2.5 bg-red-50 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors shadow-sm flex items-center justify-center gap-2 border border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa Phiên Làm Việc
                </button>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Bảng Dữ Liệu */}
          <div className="w-full lg:w-3/4 flex flex-col gap-6">
            {showDuplicates && <DuplicateDataTable />}

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

      {/* Modal Công cụ đối sánh */}
      {mounted && isToolsModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-600" />
                Công cụ đối sánh
              </h3>
              <button onClick={() => setIsToolsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <button
                onClick={() => {
                  setIsToolsModalOpen(false);
                  handleUploadClick();
                }}
                className="w-full px-4 py-3 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors shadow-sm flex items-center justify-start gap-3 border border-blue-200"
              >
                <Upload className="w-5 h-5" />
                Nạp File Excel
              </button>

              <button
                onClick={() => {
                  setIsToolsModalOpen(false);
                  matchApp.startWebcam();
                }}
                className="w-full px-4 py-3 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors shadow-sm flex items-center justify-start gap-3 border border-indigo-200"
              >
                <Camera className="w-5 h-5" />
                Quét mã bằng Camera
              </button>

              {!isDeviceScannerActive ? (
                <button
                  onClick={() => setIsDeviceScannerActive(true)}
                  className="w-full px-4 py-3 bg-purple-50 text-purple-700 font-semibold rounded-lg hover:bg-purple-100 transition-colors shadow-sm flex items-center justify-start gap-3 border border-purple-200"
                >
                  <Barcode className="w-5 h-5" />
                  Nhận từ Máy Quét (PC)
                </button>
              ) : (
                <div className="w-full p-3 bg-white border-2 border-dashed border-indigo-500 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-indigo-600 font-bold text-[11px] animate-pulse">
                      Đang chờ tín hiệu từ máy quét...
                    </p>
                    <button
                      onClick={() => setIsDeviceScannerActive(false)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Đóng"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    autoFocus
                    rows={4}
                    onKeyDown={matchApp.handleScannerInput}
                    className="break-all w-full bg-gray-100 border border-gray-300 rounded p-2 text-xs font-mono text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Dữ liệu quét sẽ hiển thị tại đây..."
                  />
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
