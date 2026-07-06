// src/app/page.tsx
"use client";

import { useScannerApp } from "@/hooks/useScannerApp";

import ConfirmModal from "@/components/ConfirmModal";
import ControlPanel from "@/components/ControlPanel";
import DataTable from "@/components/DataTable";
import ScannerSection from "@/components/ScannerSection";
import Toast from "@/components/Toast";

export default function Home() {
  // Lấy ra mọi thứ từ "bộ não" đã thiết lập ở Custom Hook
  const app = useScannerApp();

  return (
    <main className="min-h-screen bg-gray-50 p-4 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4">Hệ Thống Quét Mã Căn Cước</h2>

        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-600">
            Tổng số đã quét: <span className="text-pink-600 text-2xl ml-2">{app.data.length}</span>
          </h3>
        </div>

        <ControlPanel
          isDeviceScannerActive={app.isDeviceScannerActive}
          isWebCamActive={app.isWebCamActive}
          onToggleDeviceScanner={app.toggleDeviceScanner}
          onStartWebcam={app.startWebcam}
          onStopWebcam={app.stopWebcam}
          onFileUpload={app.handleFileUpload}
          onClearData={app.requestClearData}
          onExportExcel={app.handleExportExcel} // Gọi hàm mới
          isExporting={app.isExporting} // Truyền trạng thái khóa nút
        />

        <ScannerSection
          isWebCamActive={app.isWebCamActive}
          isDeviceScannerActive={app.isDeviceScannerActive}
          scannerInputRef={app.scannerInputRef}
          onScannerInput={app.handleScannerInput}
        />

        <DataTable data={app.data} />
      </div>

      {app.toastMsg && (
        <Toast
          msg={app.toastMsg.msg}
          type={app.toastMsg.type}
          progress={app.exportProgress !== null ? app.exportProgress : undefined}
        />
      )}

      <ConfirmModal
        isOpen={app.modalConfig.isOpen}
        title="Cảnh báo xóa dữ liệu"
        message={app.modalConfig.message}
        onConfirm={app.confirmClearData}
        onCancel={app.closeModal}
      />
    </main>
  );
}