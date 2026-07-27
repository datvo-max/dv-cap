import React from "react";

interface ScannerSectionProps {
  isWebCamActive: boolean;
  isFlashActive: boolean;
  onStopWebcam: () => void;
  // Các props sau dùng cho hidden elements (luôn trong DOM)
  scannerInputRef: React.RefObject<HTMLInputElement | null>;
  onScannerInput: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onScannerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ScannerSection({
  isWebCamActive,
  isFlashActive,
  onStopWebcam,
  scannerInputRef,
  onScannerInput,
  onScannerChange,
}: ScannerSectionProps) {
  return (
    <>
      {/* Webcam Inline View — hiển thị gọn ở cột trái khi camera đang mở */}
      <div className={isWebCamActive ? "block w-full" : "hidden"}>
        <div className="w-full p-3 bg-white border-2 border-dashed border-blue-500 rounded-lg shadow-sm flex flex-col gap-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-blue-100 pb-1.5">
            <span className="text-[11px] font-bold text-blue-700 uppercase flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Camera đang mở...
            </span>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded border border-blue-200">
              Quét tự động
            </span>
          </div>

          {/* Khung camera chuẩn kỹ thuật - loại bỏ max-h-64 và flex để không bị cắt xén video trên mobile */}
          <div className="relative w-full rounded-md overflow-hidden shadow-inner border border-blue-300 bg-black">
            <div id="reader" className="w-full" />
            {/* Lớp chớp sáng khi quét thành công */}
            <div
              className={`absolute inset-0 bg-white pointer-events-none z-30 transition-opacity ease-out ${
                isFlashActive ? "opacity-100 duration-0" : "opacity-0 duration-500"
              }`}
            />
          </div>

          <p className="text-[10px] leading-tight text-center font-medium text-gray-500 bg-gray-50 p-1.5 rounded border border-gray-200">
            💡 Đưa mã QR vào giữa khung camera để tự động quét và lưu vào danh sách bên phải.
          </p>

          {/* Nút đóng camera */}
          <button
            onClick={onStopWebcam}
            className="w-full py-1.5 rounded-md font-bold text-[11px] bg-red-50 text-red-700 border border-red-300 hover:bg-red-100 transition-all shadow-sm flex items-center justify-center gap-1.5 group"
          >
            <svg
              className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Tắt Camera</span>
          </button>
        </div>
      </div>

      {/* Div ẩn dùng để xử lý đọc file ảnh tải lên ngầm — luôn trong DOM */}
      <div id="file-scanner" className="hidden" />

      {/* Input ẩn dùng cho máy quét vật lý — luôn trong DOM */}
      <input
        ref={scannerInputRef}
        type="text"
        onKeyDown={onScannerInput}
        onChange={onScannerChange}
        className="absolute left-[-9999px] opacity-0"
        aria-hidden="true"
      />
    </>
  );
}