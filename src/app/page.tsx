"use client";

import { useEffect, useState } from "react";
import { useScannerApp } from "@/features/intake/hooks/useScannerApp";
import { useCardReturnApp } from "@/features/delivery/hooks/useCardReturnApp";

import Header from "@/shared/components/Header";
import Toast from "@/shared/components/Toast";
import ConfirmModal from "@/shared/components/ConfirmModal";
import EditCardModal from "@/features/delivery/components/EditCardModal";
import LoginScreen from "@/shared/components/LoginScreen";
import { useAuth } from "@/shared/context/AuthContext";

// --- COMPONENTS CỦA PHÂN HỆ 1 ---
import DashboardReport from "@/features/intake/components/DashboardReport";
import ControlPanel from "@/features/intake/components/ControlPanel";
import ScannerSection from "@/features/intake/components/ScannerSection";
import DataTable from "@/features/intake/components/DataTable";

// --- COMPONENTS CỦA PHÂN HỆ 2 ---
import ReturnDashboard from "@/features/delivery/components/ReturnDashboard";
import ReturnDataTable from "@/features/delivery/components/ReturnDataTable";
import ReturnScannerSection from "@/features/delivery/components/ReturnScannerSection";
import ReturnControlPanel from "@/features/delivery/components/ReturnControlPanel";

// --- COMPONENT CỦA PHÂN HỆ 3 (MỚI) ---
import UnissuedDataTable from "@/features/appointments/components/UnissuedDataTable";
import ExportConfigModal from "@/features/delivery/components/ExportConfigModal";
import MergeBoxesModal from "@/features/delivery/components/MergeBoxesModal";
import AssignShipperModal from "@/features/delivery/components/AssignShipperModal";

export default function Home() {
  const { user, isAllowed, loading, isGuest } = useAuth();
  // MỚI: Thêm trạng thái tab 'giay-hen'
  const [activeTab, setActiveTab] = useState<'nhap-lieu' | 'tra-the' | 'giay-hen'>('nhap-lieu');

  const app = useScannerApp();
  const returnApp = useCardReturnApp();

  const activeToasts = activeTab === 'nhap-lieu' ? app.toasts : returnApp.toasts;
  const activeProgress = activeTab === 'nhap-lieu' ? app.exportProgress : returnApp.exportProgress;

  const activeModalConfig = activeTab === 'nhap-lieu' ? app.modalConfig : returnApp.modalConfig;
  const activeConfirmClear = activeTab === 'nhap-lieu' ? app.confirmClearData : returnApp.confirmClearData;
  const activeCloseModal = activeTab === 'nhap-lieu' ? app.closeModal : returnApp.closeModal;

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
      const savedTab = localStorage.getItem('cccd_active_tab') as 'nhap-lieu' | 'tra-the' | 'giay-hen' | null;
      if (savedTab) {
        setActiveTab(savedTab);
      }
    }, 0);
  }, []);

  const handleTabChange = (tab: 'nhap-lieu' | 'tra-the' | 'giay-hen') => {
    setActiveTab(tab);
    localStorage.setItem('cccd_active_tab', tab);
  };

  if (loading || (!user && !isGuest) || !isAllowed) {
    return <LoginScreen />;
  }

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-10">
      <Header />

      {isMounted && <div className="max-w-[1700px] mx-auto px-4">

        {/* THANH ĐIỀU HƯỚNG 3 TAB */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1.5 rounded-xl flex flex-wrap justify-center gap-2 shadow-sm border border-gray-200 max-w-full">
            <button
              onClick={() => handleTabChange('nhap-lieu')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${activeTab === 'nhap-lieu'
                ? "bg-blue-600 text-white shadow-md transform scale-105"
                : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                }`}
            >
              📥 PHÂN HỆ 1: LẬP DANH SÁCH
            </button>
            <button
              onClick={() => handleTabChange('tra-the')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${activeTab === 'tra-the'
                ? "bg-indigo-600 text-white shadow-md transform scale-105"
                : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
            >
              📤 PHÂN HỆ 2: KHO & TRẢ THẺ
            </button>
            <button
              onClick={() => handleTabChange('giay-hen')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${activeTab === 'giay-hen'
                ? "bg-orange-600 text-white shadow-md transform scale-105"
                : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
                }`}
            >
              📑 PHÂN HỆ 3: THEO DÕI GIẤY HẸN
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* NỘI DUNG TAB 1 */}
        {/* ======================================================== */}
        {activeTab === 'nhap-lieu' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <DashboardReport />
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="w-full lg:w-1/4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm lg:sticky lg:top-24 space-y-4">
                <h4 className="text-sm font-bold text-gray-700 border-b pb-2 mb-2">Bảng Điều Khiển Quét</h4>
                <ControlPanel
                  isDeviceScannerActive={app.isDeviceScannerActive}
                  isWebCamActive={app.isWebCamActive}
                  isExporting={app.isExporting}
                  onToggleDeviceScanner={app.toggleDeviceScanner}
                  onStartWebcam={app.startWebcam}
                  onStopWebcam={app.stopWebcam}
                  onExportExcel={app.handleExportExcel}
                  onClearData={app.requestClearData}
                  onFileUpload={app.handleFileUpload}
                />
                <ScannerSection
                  isWebCamActive={app.isWebCamActive}
                  isDeviceScannerActive={app.isDeviceScannerActive}
                  isFlashActive={app.isFlashActive}
                  scannerDisplayValue={app.scannerDisplayValue}
                  scannerInputRef={app.scannerInputRef}
                  onScannerInput={app.handleScannerInput}
                  onScannerChange={app.handleScannerChange}
                />
              </div>

              <div className="w-full lg:w-3/4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-gray-700">Danh Sách Bản Ghi</h4>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => app.setSortOrder(app.sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="flex items-center gap-1.5 p-1.5 text-xs font-semibold rounded-lg border transition-colors bg-white hover:bg-gray-50 text-gray-600 border-gray-300 shadow-sm"
                      title="Thay đổi thứ tự hiển thị"
                    >
                      {app.sortOrder === 'asc' ? (
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path></svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path></svg>
                      )}
                      {app.sortOrder === 'asc' ? 'Mặc định' : 'Mới nhất'}
                    </button>
                    <span className="text-xs bg-blue-50 text-blue-700 font-bold inline-block p-1.5 rounded-lg border border-blue-200 shadow-sm">
                      Tổng cộng: {app.data.length} người
                    </span>
                  </div>
                </div>
                <DataTable data={app.data} onDeleteRow={app.deleteRecord} />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* NỘI DUNG TAB 2 */}
        {/* ======================================================== */}
        {activeTab === 'tra-the' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ReturnScannerSection
              isWebCamActive={returnApp.isWebCamActive}
              cameraAction={returnApp.cameraAction}
              isFlashActive={returnApp.isFlashActive}
              onStopWebcam={returnApp.stopWebcam}
            />

            <div className={returnApp.isWebCamActive ? 'hidden' : 'block'}>
              <ReturnDashboard />
              <div className="flex flex-col lg:flex-row gap-6 items-start mt-6">
                <div className="w-full lg:w-1/4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm lg:sticky lg:top-24 flex flex-col gap-5">
                  <h4 className="text-sm font-bold text-gray-700 border-b pb-2">Bảng Công cụ</h4>
                  <ReturnControlPanel
                    onImportExcel={returnApp.handleImportExcel}
                    importInputRef={returnApp.importInputRef}
                    onImportScannerInput={returnApp.handleImportScannerInput}
                    onStartWebcam={returnApp.startWebcam}
                    returnInputRef={returnApp.returnInputRef}
                    onReturnScannerInput={returnApp.handleReturnScannerInput}
                    onExportExcel={returnApp.openExportModal}
                    onBackupDatabase={returnApp.handleBackupDatabase}
                    onRestoreDatabase={returnApp.handleRestoreDatabase}
                    onRequestClearData={returnApp.requestClearData}
                    isNoPhotoImport={returnApp.isNoPhotoImport}
                    onToggleNoPhotoImport={returnApp.setIsNoPhotoImport}
                    onForceNextBox={returnApp.handleForceNextBox}
                    onOpenMergeModal={returnApp.openMergeModal}
                  />
                </div>
                <div className="w-full lg:w-3/4">
                  <ReturnDataTable
                    onReturnCard={returnApp.processReturnCard}
                    onUndoReturn={returnApp.undoReturnCard}
                    onEditCard={returnApp.openEditModal}
                    selectedIds={returnApp.selectedIds}
                    isSelectMode={returnApp.isSelectMode}
                    onToggleSelectMode={returnApp.setIsSelectMode}
                    onToggleSelectCard={returnApp.toggleSelectCard}
                    onToggleSelectAll={returnApp.toggleSelectAll}
                    onClearSelection={returnApp.clearSelection}
                    onAssignShipper={returnApp.openAssignShipperModal}
                    onBulkConfirmDelivered={returnApp.executeBulkConfirmDelivered}
                    onBulkReturnToWarehouse={returnApp.executeBulkReturnToWarehouse}
                    onOpenExportModal={returnApp.openExportModal}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* NỘI DUNG TAB 3 (MỚI) */}
        {/* ======================================================== */}
        {activeTab === 'giay-hen' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-5xl mx-auto">
            <UnissuedDataTable />
          </div>
        )}

      </div>}

      <Toast toasts={activeToasts} progress={activeProgress} />

      <ConfirmModal
        isOpen={activeModalConfig.isOpen}
        title="Cảnh báo xóa dữ liệu"
        message={activeModalConfig.message}
        onConfirm={activeConfirmClear}
        onCancel={activeCloseModal}
      />

      <EditCardModal
        isOpen={returnApp.editModalConfig.isOpen}
        cardId={returnApp.editModalConfig.cardId}
        onClose={returnApp.closeEditModal}
        onSave={returnApp.updateCardDetails}
        onDelete={returnApp.deleteCard}
        onShowToast={returnApp.showToast}
        onUndoReturn={returnApp.undoReturnCard}
      />
      <ExportConfigModal
        isOpen={returnApp.exportModalConfig.isOpen}
        exportType={returnApp.exportModalConfig.type}
        onClose={returnApp.closeExportModal}
        onConfirm={returnApp.executeExportExcel}
      />
      <MergeBoxesModal
        isOpen={returnApp.mergeModalConfig.isOpen}
        onClose={returnApp.closeMergeModal}
        onMerge={returnApp.executeMergeBoxes}
        onShowToast={returnApp.showToast}
      />
      <AssignShipperModal
        isOpen={returnApp.assignShipperModalConfig.isOpen}
        onClose={returnApp.closeAssignShipperModal}
        onConfirm={returnApp.executeAssignShipper}
      />
    </main>
  );
}