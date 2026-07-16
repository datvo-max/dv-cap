// src/components/Toast.tsx
import React from "react";

export interface ToastData {
  id: number;
  msg: string;
  type: "success" | "error" | "warning" | "info";
}

interface ToastContainerProps {
  toasts: ToastData[];
  progress?: number | null; // Thanh tiến trình xuất Excel được tách riêng biệt
}

export default function Toast({ toasts, progress }: ToastContainerProps) {
  const bgColors = {
    success: 'bg-green-600 border-green-800',
    warning: 'bg-yellow-500 border-yellow-700',
    error: 'bg-red-600 border-red-800',
    info: 'bg-blue-600 border-blue-800'
  };

  return (
    // z-50 đảm bảo luôn nằm trên cùng, pointer-events-none để không chặn click chuột vào nền
    <div className=" fixed bottom-5 right-5 z-1000 flex flex-col gap-3 pointer-events-none">

      {/* 1. Lặp qua mảng để render các Toast thông báo xếp chồng */}
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`w-80 rounded-lg shadow-lg text-white font-bold transition-all border-l-4 overflow-hidden animate-in slide-in-from-right-5 fade-in duration-300 pointer-events-auto ${bgColors[toast.type]}`}
        >
          <div className="px-6 py-3">
            {toast.msg}
          </div>
        </div>
      ))}

      {/* 2. Render riêng 1 Toast dính chặt dưới cùng dành cho Tiến trình xuất Excel */}
      {progress !== undefined && progress !== null && (
        <div className="w-80 rounded-lg shadow-xl text-white font-bold border-l-4 border-blue-800 bg-blue-600 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto">
          <div className="px-6 py-3 flex justify-between items-center text-sm">
            <span>Đang xuất dữ liệu...</span>
            <span className="text-blue-200">{progress}%</span>
          </div>
          <div className="w-full bg-black/20 h-1.5">
            <div
              className="bg-white h-1.5 transition-all duration-200 ease-out"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
        </div>
      )}

    </div>
  );
}