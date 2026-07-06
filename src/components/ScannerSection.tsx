import React from "react";

interface ScannerSectionProps {
  isWebCamActive: boolean;
  isDeviceScannerActive: boolean;
  scannerDisplayValue: string; // dữ liệu hiển thị trên ô
  scannerInputRef: React.RefObject<HTMLInputElement | null>;
  onScannerInput: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onScannerChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // hiển thị trên ô
  isFlashActive: boolean;
}

export default function ScannerSection({
  isWebCamActive, isDeviceScannerActive,
  scannerInputRef, scannerDisplayValue,
  onScannerInput, onScannerChange, isFlashActive
}: ScannerSectionProps) {
  return (
    <div className="flex flex-col items-center mb-6">


      <div className="relative w-full max-w-md rounded-lg overflow-hidden shadow-md bg-black">
        {/* Khung chứa Camera */}
        <div id="reader" className={`w-full ${isWebCamActive ? 'block' : 'hidden'}`}></div>

        {/* Lớp chớp sáng máy ảnh */}
        <div
          className={`absolute inset-0 bg-white pointer-events-none z-30 transition-opacity ease-out ${isFlashActive ? "opacity-100 duration-0" : "opacity-0 duration-500"
            }`}
        />
      </div>
      {/* Khung ẩn dùng để xử lý đọc file ảnh tải lên ngầm */}
      <div id="file-scanner" className="hidden"></div>

      <input
        ref={scannerInputRef}
        type="text"
        onKeyDown={onScannerInput}
        onChange={onScannerChange}
        className="absolute left-[-9999px] opacity-0"
        aria-hidden="true"
      />

      {isDeviceScannerActive && (
        <div className="w-full max-w-md p-4 bg-white border-2 border-dashed border-purple-500 rounded-lg text-center mt-4 shadow-sm">
          <p className="text-purple-600 font-bold mb-2 animate-pulse">Đang chờ tín hiệu từ máy quét phần cứng...</p>
          <textarea
            readOnly
            className="w-full h-20 bg-gray-100 border border-gray-300 rounded p-2 text-sm font-mono text-gray-700 resize-none pointer-events-none"
            placeholder="Dữ liệu sẽ hiển thị ở đây..."
            value={scannerDisplayValue}
          />
        </div>
      )}
    </div>
  );
}