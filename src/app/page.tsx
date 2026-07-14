// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useScannerApp } from "@/hooks/useScannerApp";

import ControlPanel from "@/components/ControlPanel";
import ScannerSection from "@/components/ScannerSection";
import DataTable from "@/components/DataTable";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import Header from "@/components/Header";
import DashboardReport from "@/components/DashboardReport";

export default function Home() {
  const router = useRouter();
  const app = useScannerApp();

  // useEffect(() => {
  //   if (!user) router.push("/login");
  // }, [user, router]);

  // if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-10">
      <Header />

      {/* NỚI RỘNG TOÀN BỘ KHUNG GIAO DIỆN CHÍNH */}
      <div className="max-w-[1700px] mx-auto px-4">

        {/* Phần báo cáo số liệu Google Sheet vẫn nằm trải dài ở trên cùng cho thoáng đạt */}
        <DashboardReport />

        {/* BỐ CỤC PHÂN CHIA 2 CỘT CHO MÁY TÍNH */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* 💻 BÊN TRÁI: CỤM CÔNG CỤ ĐIỀU KHIỂN & CAMERA (CHIẾM VỪA ĐÚNG ~25%) */}
          {/* Cài đặt sticky giúp khu vực này luôn ghim cố định ở góc màn hình khi cuộn bảng */}
          <div className="w-full lg:w-1/4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm lg:sticky lg:top-4 space-y-4">
            <h4 className="text-sm font-bold text-gray-700 border-b pb-2 mb-2">Bàn Điều Khiển Quét</h4>
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

          {/* 📊 BÊN PHẢI: DANH SÁCH BẢNG DỮ LIỆU ĐÃ QUÉT ĐƯỢC (CHIẾM ~75%) */}
          <div className="w-full lg:w-3/4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-gray-700">Danh Sách Bản Ghi Hồ Sơ</h4>
              <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-full border border-blue-200">
                Tổng cộng: {app.data.length} người
              </span>
            </div>
            <DataTable
              data={app.data}
              onDeleteRow={app.deleteRecord}
            />
          </div>

        </div>
      </div>

      {app.toastMsg && <Toast msg={app.toastMsg.msg} type={app.toastMsg.type} progress={app.exportProgress !== null ? app.exportProgress : undefined} />}
      <ConfirmModal isOpen={app.modalConfig.isOpen} title="Cảnh báo xóa dữ liệu" message={app.modalConfig.message} onConfirm={app.confirmClearData} onCancel={app.closeModal} />
    </main>
  );
}