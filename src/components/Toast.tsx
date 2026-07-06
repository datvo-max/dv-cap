// src/components/Toast.tsx
import React from "react";

interface ToastProps {
  msg: string;
  type: "success" | "error" | "warning" | "info";
  progress?: number; // Truyền % tiến trình vào đây (0 - 100)
}

export default function Toast({ msg, type, progress }: ToastProps) {
  const bgColors = {
    success: 'bg-green-600 border-green-800',
    warning: 'bg-yellow-500 border-yellow-700',
    error: 'bg-red-600 border-red-800',
    info: 'bg-blue-600 border-blue-800'
  };

  return (
    <div className={`fixed bottom-5 right-5 w-80 rounded-lg shadow-lg text-white font-bold transition-all duration-300 transform translate-x-0 border-l-4 overflow-hidden ${bgColors[type]}`}>
      <div className="px-6 py-3">
        {msg}
      </div>

      {/* Hiển thị thanh Progress Bar nếu có truyền thuộc tính progress */}
      {progress !== undefined && (
        <div className="w-full bg-black/20 h-1.5">
          <div
            className="bg-white h-1.5 transition-all duration-200 ease-out"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}