// src/components/ReturnScannerSection.tsx
import React from "react";

interface ReturnScannerSectionProps {
  isWebCamActive: boolean;
  cameraActionRef: React.RefObject<'import' | 'return'>;
  isFlashActive: boolean;
  onStopWebcam: () => void;
}

export default function ReturnScannerSection({
  isWebCamActive,
  cameraActionRef,
  isFlashActive,
  onStopWebcam
}: ReturnScannerSectionProps) {
  return (
    <div className={isWebCamActive ? 'block' : 'hidden'}>
      <div className="max-w-2xl mx-auto flex flex-col gap-6 mb-10 mt-4">

        {/* Khung Tiêu Đề Động */}
        <div className={`p-5 rounded-2xl border-2 shadow-sm text-center ${cameraActionRef.current === 'import' ? 'bg-blue-50 border-blue-300' : 'bg-green-50 border-green-300'}`}>
          <h2 className={`text-2xl font-black uppercase tracking-wide ${cameraActionRef.current === 'import' ? 'text-blue-800' : 'text-green-800'}`}>
            {cameraActionRef.current === 'import'
              ? "📥 Quét mã QR để Thêm thẻ vào Kho"
              : "📤 Quét mã QR để Trả thẻ cho Công dân"}
          </h2>
          <p className="text-sm mt-2 font-medium text-gray-600">
            Đưa mã QR trên mặt sau Thẻ Căn cước (mặt trước đối với Căn cước công dân) vào chính giữa khung hình
          </p>
        </div>

        {/* KHUNG CAMERA CHUẨN KỸ THUẬT */}
        <div className={`relative w-full rounded-2xl overflow-hidden shadow-xl border-4 ${cameraActionRef.current === 'import' ? 'border-blue-400' : 'border-green-400'} ${isWebCamActive ? 'bg-black' : ''}`}>
          <div id="return-reader" className={`w-full ${isWebCamActive ? 'block' : 'hidden'}`}></div>
          <div className={`absolute inset-0 bg-white pointer-events-none z-30 transition-opacity ease-out ${isFlashActive ? "opacity-100 duration-0" : "opacity-0 duration-500"}`} />
        </div>

        {/* Nút Đóng Camera */}
        <button
          onClick={onStopWebcam}
          className="w-full py-4 rounded-xl font-bold text-base bg-red-50 text-red-700 border-2 border-red-300 hover:bg-red-100 hover:text-red-800 transition-all shadow-md flex items-center justify-center gap-2.5 group"
        >
          <svg className="w-6 h-6 shrink-0 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span>ĐÓNG CAMERA</span>
        </button>

      </div>
    </div>
  );
}