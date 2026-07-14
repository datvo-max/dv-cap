// src/app/page.tsx
"use client";

import { useState } from "react";
import { useScannerApp } from "@/hooks/useScannerApp";
import { useCardReturnApp } from "@/hooks/useCardReturnApp";

import Header from "@/components/Header";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import ScannerSection from "@/components/ScannerSection";

// --- COMPONENTS CỦA PHÂN HỆ 1 (NHẬP LIỆU) ---
import DashboardReport from "@/components/DashboardReport";
import ControlPanel from "@/components/ControlPanel";
import DataTable from "@/components/DataTable";
import ReturnDashboard from "@/components/ReturnDashboard";
import ReturnDataTable from "@/components/ReturnDataTable";

// --- COMPONENTS CỦA PHÂN HỆ 2 (TRẢ THẺ) ---
// ⚠️ Lưu ý: Bạn cần lưu code bảng Dexie ở câu trước thành 2 file mới này nhé!
// import ReturnDashboard from "@/components/ReturnDashboard";
// import ReturnDataTable from "@/components/ReturnDataTable";

export default function Home() {
  // Trạng thái quản lý Tab hiện tại
  const [activeTab, setActiveTab] = useState<'nhap-lieu' | 'tra-the'>('nhap-lieu');

  // Khởi tạo 2 "bộ não" chạy song song
  const app = useScannerApp();
  const returnApp = useCardReturnApp();

  // Xác định mảng Toasts và Tiến trình Excel của Tab nào đang được kích hoạt
  const activeToasts = activeTab === 'nhap-lieu' ? app.toasts : returnApp.toasts;
  const activeProgress = activeTab === 'nhap-lieu' ? app.exportProgress : returnApp.exportProgress;

  // Xác định đang trên phân hệ nào để sử dụng modal
  const activeModalConfig = activeTab === 'nhap-lieu' ? app.modalConfig : returnApp.modalConfig;
  const activeConfirmClear = activeTab === 'nhap-lieu' ? app.confirmClearData : returnApp.confirmClearData;
  const activeCloseModal = activeTab === 'nhap-lieu' ? app.closeModal : returnApp.closeModal;

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-10">
      <Header />

      <div className="max-w-[1700px] mx-auto px-4">

        {/* THANH ĐIỀU HƯỚNG TAB */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1.5 rounded-xl inline-flex shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab('nhap-lieu')}
              className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'nhap-lieu'
                ? "bg-blue-600 text-white shadow-md transform scale-105"
                : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                }`}
            >
              📥 PHÂN HỆ 1: QUÉT QR & LẬP DANH SÁCH
            </button>
            <button
              onClick={() => setActiveTab('tra-the')}
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
        {/* NỘI DUNG TAB 1: GIỮ NGUYÊN 100% CẤU TRÚC HIỆN TẠI CỦA BẠN */}
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
        {/* NỘI DUNG TAB 2: PHÂN HỆ QUẢN LÝ KHO THẺ MỚI */}
        {/* ======================================================== */}
        {activeTab === 'tra-the' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ReturnDashboard />

            <div className="flex flex-col lg:flex-row gap-6 items-start">

              {/* BẢNG ĐIỀU KHIỂN RIÊNG CHO TRẢ THẺ (Đã thiết kế lại UI/UX) */}
              {/* Đã thay space-y-5 bằng flex flex-col gap-5 để ép khoảng cách */}
              <div className="w-full lg:w-1/4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm lg:sticky lg:top-24 flex flex-col gap-5">
                <h4 className="text-sm font-bold text-gray-700 border-b pb-2">Bàn Điều Hành Kho Thẻ</h4>

                {/* 📥 KHỐI 1: NẠP DỮ LIỆU */}
                {/* Đã thay space-y-3 bằng flex flex-col gap-3 */}
                <div className="bg-blue-50/40 p-3 rounded-lg border border-blue-100 flex flex-col gap-3">
                  <p className="text-[11px] font-bold text-blue-700 uppercase flex items-center gap-1.5 mb-1">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    Nạp thẻ vào kho
                  </p>

                  <button className="w-full relative flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-xs shadow-sm">
                    Nạp từ file Excel (Hàng loạt)
                    <input type="file" accept=".xlsx, .xls" onChange={returnApp.handleImportExcel} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </button>

                  <input
                    ref={returnApp.importInputRef}
                    onKeyDown={returnApp.handleImportScannerInput}
                    placeholder="🔫 Cắm súng quét, đặt chuột vào đây..."
                    className="w-full pl-3 pr-3 py-2 border border-blue-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    title="Nạp lẻ bằng máy quét phần cứng"
                  />

                  <button
                    onClick={() => returnApp.isWebCamActive && returnApp.cameraActionRef.current === 'import' ? returnApp.stopWebcam() : returnApp.startWebcam('import')}
                    className={`w-full py-2 rounded-md font-bold text-xs border transition-colors shadow-sm ${returnApp.isWebCamActive && returnApp.cameraActionRef.current === 'import' ? "bg-red-100 text-red-700 border-red-300" : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"}`}
                  >
                    {returnApp.isWebCamActive && returnApp.cameraActionRef.current === 'import' ? "Đóng Camera" : "📸 Mở Camera Nạp Lẻ"}
                  </button>
                </div>

                {/* 📤 KHỐI 2: TRẢ THẺ */}
                <div className="bg-green-50/40 p-3 rounded-lg border border-green-100 flex flex-col gap-3">
                  <p className="text-[11px] font-bold text-green-700 uppercase flex items-center gap-1.5 mb-1">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Xác nhận trả thẻ
                  </p>

                  <input
                    ref={returnApp.returnInputRef}
                    onKeyDown={returnApp.handleReturnScannerInput}
                    placeholder="🔫 Cắm súng quét, đặt chuột vào đây..."
                    className="w-full pl-3 pr-3 py-2 border border-green-200 rounded-md text-xs focus:ring-2 focus:ring-green-500 outline-none"
                    title="Trả thẻ bằng máy quét phần cứng"
                  />

                  <button
                    onClick={() => returnApp.isWebCamActive && returnApp.cameraActionRef.current === 'return' ? returnApp.stopWebcam() : returnApp.startWebcam('return')}
                    className={`w-full py-2 rounded-md font-bold text-xs border transition-colors shadow-sm ${returnApp.isWebCamActive && returnApp.cameraActionRef.current === 'return' ? "bg-red-100 text-red-700 border-red-300" : "bg-white text-green-700 border-green-300 hover:bg-green-50"}`}
                  >
                    {returnApp.isWebCamActive && returnApp.cameraActionRef.current === 'return' ? "Đóng Camera" : "📸 Mở Camera Trả Thẻ"}
                  </button>
                </div>


                <div className="relative w-full max-w-md rounded-lg overflow-hidden shadow-md bg-black">
                  {/* Khung chứa Camera */}
                  <div id="return-section" className={`w-full ${returnApp.isWebCamActive ? 'block' : 'hidden'}`}></div>

                  {/* Lớp chớp sáng máy ảnh */}
                  <div
                    className={`absolute inset-0 bg-white pointer-events-none z-30 transition-opacity ease-out ${returnApp.isFlashActive ? "opacity-100 duration-0" : "opacity-0 duration-500"
                      }`}
                  />
                </div>



                {/* 📊 KHỐI 3: XUẤT BÁO CÁO EXCEL */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-[11px] font-bold text-gray-500 uppercase mb-2">Xuất báo cáo</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => returnApp.handleExportExcel('pending')} className="bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold py-1.5 px-2 rounded text-[11px] border border-orange-200 transition-colors">Xuất Còn lại</button>
                    <button onClick={() => returnApp.handleExportExcel('returned')} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-1.5 px-2 rounded text-[11px] border border-emerald-200 transition-colors">Xuất Đã trả</button>
                    <button onClick={() => returnApp.handleExportExcel('all')} className="col-span-2 bg-white hover:bg-gray-100 text-gray-700 font-bold py-1.5 px-2 rounded text-[11px] border border-gray-300 transition-colors">⬇ Tải Toàn bộ Kho</button>
                    <button
                      onClick={returnApp.requestClearData}
                      className="col-span-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-1.5 px-2 rounded text-[11px] border border-red-200 transition-colors shadow-sm mt-1"
                    >
                      🗑️ Xóa Toàn Bộ Dữ Liệu Kho
                    </button>
                  </div>
                </div>

              </div>


              {/* BẢNG DỮ LIỆU TRẢ THẺ (Tìm kiếm & Xác nhận) */}
              <div className="w-full lg:w-3/4">
                <ReturnDataTable onReturnCard={returnApp.processReturnCard} />
              </div>
            </div>
          </div>
        )}

      </div>

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