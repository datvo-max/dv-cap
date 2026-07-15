// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useScannerApp } from "@/hooks/useScannerApp";
import { useCardReturnApp } from "@/hooks/useCardReturnApp";

import Header from "@/components/Header";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";

// --- COMPONENTS CỦA PHÂN HỆ 1 ---
import DashboardReport from "@/components/DashboardReport";
import ControlPanel from "@/components/ControlPanel";
import ScannerSection from "@/components/ScannerSection";
import DataTable from "@/components/DataTable";

// --- COMPONENTS CỦA PHÂN HỆ 2 ---
import ReturnDashboard from "@/components/ReturnDashboard";
import ReturnDataTable from "@/components/ReturnDataTable";
import ReturnScannerSection from "@/components/ReturnScannerSection";
import ReturnControlPanel from "@/components/ReturnControlPanel";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'nhap-lieu' | 'tra-the'>('nhap-lieu');

  const app = useScannerApp();
  const returnApp = useCardReturnApp();

  const activeToasts = activeTab === 'nhap-lieu' ? app.toasts : returnApp.toasts;
  const activeProgress = activeTab === 'nhap-lieu' ? app.exportProgress : returnApp.exportProgress;

  const activeModalConfig = activeTab === 'nhap-lieu' ? app.modalConfig : returnApp.modalConfig;
  const activeConfirmClear = activeTab === 'nhap-lieu' ? app.confirmClearData : returnApp.confirmClearData;
  const activeCloseModal = activeTab === 'nhap-lieu' ? app.closeModal : returnApp.closeModal;

  const [isMounted, setIsMounted] = useState(false);
  // 1. Đọc trạng thái lưu trữ khi trang vừa tải xong
  useEffect(() => {
    setIsMounted(true);
    const savedTab = localStorage.getItem('cccd_active_tab') as 'nhap-lieu' | 'tra-the' | null;
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // 2. Hàm xử lý chuyển Tab kết hợp lưu LocalStorage
  const handleTabChange = (tab: 'nhap-lieu' | 'tra-the') => {
    setActiveTab(tab);
    localStorage.setItem('cccd_active_tab', tab);
  };

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-10">
      <Header />

      {isMounted && <div className="max-w-[1700px] mx-auto px-4">

        {/* THANH ĐIỀU HƯỚNG TAB */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1.5 rounded-xl inline-flex shadow-sm border border-gray-200">
            <button
              onClick={() => handleTabChange('nhap-lieu')}
              className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'nhap-lieu'
                ? "bg-blue-600 text-white shadow-md transform scale-105"
                : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                }`}
            >
              📥 PHÂN HỆ 1: QUÉT QR & LẬP DANH SÁCH
            </button>
            <button
              onClick={() => handleTabChange('tra-the')}
              className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'tra-the'
                ? "bg-indigo-600 text-white shadow-md transform scale-105"
                : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
            >
              📤 PHÂN HỆ 2: QUẢN LÝ KHO & TRẢ THẺ
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
                  <h4 className="text-sm font-bold text-gray-700">Danh Sách Bản Ghi Hồ Sơ</h4>
                  <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-full border border-blue-200">
                    Tổng cộng: {app.data.length} người
                  </span>
                </div>
                <DataTable data={app.data} onDeleteRow={app.deleteRecord} />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* NỘI DUNG TAB 2 (Đã Tái Cấu Trúc) */}
        {/* ======================================================== */}
        {activeTab === 'tra-the' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

            {/* Chế độ 1: Camera (Chỉ hiện khi mở Camera) */}
            <ReturnScannerSection
              isWebCamActive={returnApp.isWebCamActive}
              cameraActionRef={returnApp.cameraActionRef}
              isFlashActive={returnApp.isFlashActive}
              onStopWebcam={returnApp.stopWebcam}
            />

            {/* Chế độ 2: Dashboard bình thường (Chỉ hiện khi Camera tắt) */}
            <div className={returnApp.isWebCamActive ? 'hidden' : 'block'}>
              <ReturnDashboard />

              <div className="flex flex-col lg:flex-row gap-6 items-start mt-6">

                {/* Bảng Điều Khiển (Trái) */}
                <div className="w-full lg:w-1/4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm lg:sticky lg:top-24 flex flex-col gap-5">
                  <h4 className="text-sm font-bold text-gray-700 border-b pb-2">Bàn Điều Hành Kho Thẻ</h4>
                  <ReturnControlPanel
                    onImportExcel={returnApp.handleImportExcel}
                    importInputRef={returnApp.importInputRef}
                    onImportScannerInput={returnApp.handleImportScannerInput}
                    onStartWebcam={returnApp.startWebcam}
                    returnInputRef={returnApp.returnInputRef}
                    onReturnScannerInput={returnApp.handleReturnScannerInput}
                    onExportExcel={returnApp.handleExportExcel}
                    onBackupDatabase={returnApp.handleBackupDatabase}
                    onRestoreDatabase={returnApp.handleRestoreDatabase}
                    onRequestClearData={returnApp.requestClearData}
                  />
                </div>

                {/* Bảng Dữ Liệu (Phải) */}
                <div className="w-full lg:w-3/4">
                  <ReturnDataTable onReturnCard={returnApp.processReturnCard} />
                </div>

              </div>
            </div>

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
    </main>
  );
}