// src/components/Header.tsx
import React from "react";
import logoImg from "../../public/Logo-BCA.png";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex justify-between items-center mb-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Image
          src={logoImg}
          alt="Logo Hệ Thống"
          className="w-10 h-10 object-contain"
        />
        <h1 className="text-xl font-bold text-blue-900 border-r pr-4 border-gray-300">
          Tân An
        </h1>
        <span className="text-sm font-medium text-gray-500 hidden md:block">
          Quét QR căn cước - Lập danh sách - Trả thẻ - Phiên bản: 3.0.3
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-bold text-green-700">Tốt</span>
        </div>
      </div>

    </header>
  );
}