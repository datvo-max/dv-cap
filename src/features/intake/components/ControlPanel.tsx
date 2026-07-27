import React from "react";

interface ControlPanelProps {
  isDeviceScannerActive: boolean;
  isWebCamActive: boolean;
  onToggleDeviceScanner: () => void;
  onStartWebcam: () => void;
  onStopWebcam: () => void;
  onExportExcel: () => void;
  onClearData: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isExporting: boolean;
  scannerDisplayValue: string;
}

export default function ControlPanel({
  isDeviceScannerActive,
  isWebCamActive,
  onToggleDeviceScanner,
  onStartWebcam,
  onStopWebcam,
  onExportExcel,
  onClearData,
  onFileUpload,
  isExporting,
  scannerDisplayValue,
}: ControlPanelProps) {
  const isScanning = isDeviceScannerActive || isWebCamActive;

  return (
    <div className="flex flex-col gap-4">

      {/* ===== KHỐI 1: QUÉT & NHẬP LIỆU ===== */}
      <div className="bg-blue-50/40 p-3 rounded-lg border border-blue-100 flex flex-col gap-2">
        <p className="text-[11px] font-bold text-blue-700 uppercase flex items-center gap-1.5 border-b border-blue-100 pb-1.5">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Quét & Nhập liệu
        </p>

        {/* Nút Camera Web */}
        {!isDeviceScannerActive && (
          <button
            onClick={isWebCamActive ? onStopWebcam : onStartWebcam}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md font-bold text-[11px] transition-all shadow-sm ${
              isWebCamActive
                ? "bg-red-50 text-red-700 border border-red-300 hover:bg-red-100"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.9L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {isWebCamActive ? "Đóng Camera" : "Mở Camera Web"}
          </button>
        )}

        {/* Nút Máy Quét Vật Lý (PC) */}
        {!isWebCamActive && (
          <button
            onClick={onToggleDeviceScanner}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md font-bold text-[11px] transition-all shadow-sm ${
              isDeviceScannerActive
                ? "bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200"
                : "bg-white hover:bg-purple-50 text-purple-700 border border-purple-300"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            {isDeviceScannerActive ? (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                Đang nhận QR... (Bấm dừng)
              </span>
            ) : "Nhận từ Máy Quét (PC)"}
          </button>
        )}

        {/* Nút Tải Ảnh Lên */}
        {!isScanning && (
          <label className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md font-bold text-[11px] transition-all shadow-sm cursor-pointer bg-white hover:bg-amber-50 text-amber-700 border border-amber-300 m-0">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Tải ảnh lên
            <input type="file" accept="image/*" multiple onChange={onFileUpload} className="hidden" />
          </label>
        )}

        {/* Hiển thị dữ liệu từ máy quét vật lý */}
        {isDeviceScannerActive && (
          <div className="w-full p-3 bg-white border-2 border-dashed border-purple-500 rounded-lg text-center shadow-sm mt-1">
            <p className="text-purple-600 font-bold text-[11px] mb-2 animate-pulse">
              Đang chờ tín hiệu từ máy quét...
            </p>
            <textarea
              readOnly
              rows={4}
              className="break-all w-full bg-gray-100 border border-gray-300 rounded p-2 text-xs font-mono text-gray-700 resize-none pointer-events-none"
              placeholder="Dữ liệu sẽ hiển thị ở đây..."
              value={scannerDisplayValue}
            />
          </div>
        )}
      </div>

      {/* ===== KHỐI 2: XUẤT & QUẢN LÝ ===== */}
      {!isScanning && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col gap-2">
          <p className="text-[11px] font-bold text-gray-500 uppercase border-b border-gray-200 pb-1.5">
            Xuất & Quản lý
          </p>

          {/* Xuất Excel */}
          <button
            onClick={onExportExcel}
            disabled={isExporting}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md font-bold text-[11px] transition-all shadow-sm ${
              isExporting
                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {isExporting ? "Đang xử lý..." : "Xuất Excel"}
          </button>

          {/* Xóa dữ liệu */}
          <button
            onClick={onClearData}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md font-bold text-[11px] transition-all shadow-sm bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Xóa dữ liệu
          </button>
        </div>
      )}
    </div>
  );
}