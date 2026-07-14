import React from "react";

interface ControlPanelProps {
  isDeviceScannerActive: boolean;
  isWebCamActive: boolean;
  onToggleDeviceScanner: () => void;
  onStartWebcam: () => void;
  onStopWebcam: () => void;
  onExportExcel: () => void;
  onClearData: () => void;
  // Thêm hàm xử lý tải file
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isExporting: boolean;
}

export default function ControlPanel({
  isDeviceScannerActive, isWebCamActive,
  onToggleDeviceScanner, onStartWebcam, onStopWebcam,
  onExportExcel, onClearData, onFileUpload, isExporting
}: ControlPanelProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-6">
      <button
        onClick={onToggleDeviceScanner}
        className={`px-4 py-2 text-white font-bold rounded-lg transition ${isDeviceScannerActive ? 'bg-red-500 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'}`}
      >
        {isDeviceScannerActive ? "Đang Nhận QR... (Bấm Dừng)" : "Nhận Từ Máy Quét (PC)"}
      </button>
      {!isDeviceScannerActive && !isWebCamActive &&
        <button
          onClick={onExportExcel}
          disabled={isExporting}
          className={`px-4 py-2 font-bold rounded-lg transition text-white ${isExporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isExporting ? "Đang Xử Lý..." : "Xuất Excel"}
        </button>}

      {!isWebCamActive ? (
        <button onClick={onStartWebcam} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition">Mở Camera Web</button>
      ) : (
        <button onClick={onStopWebcam} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition">Đóng Camera</button>
      )}

      {/* NÚT TẢI ẢNH / CHỤP THỦ CÔNG */}
      {!isDeviceScannerActive && !isWebCamActive &&
        <label className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition cursor-pointer flex items-center justify-center m-0">
          Tải Ảnh Lên
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onFileUpload}
            className="hidden"
          />
        </label>}

      {!isDeviceScannerActive && !isWebCamActive &&
        <button
          onClick={onClearData}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition">
          Xóa Dữ Liệu</button>}
    </div>
  );
}