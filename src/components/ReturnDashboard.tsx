"use client";

import React from "react";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export default function ReturnDashboard() {
  const today = new Date().toISOString().split('T')[0];

  // Tự động lắng nghe và đếm số lượng từ IndexedDB
  const totalCards = useLiveQuery(() => db.cards.count()) || 0;
  const todayImport = useLiveQuery(() => db.cards.where('importDate').equals(today).count()) || 0;
  const returnedCards = useLiveQuery(() => db.cards.where('status').equals('returned').count()) || 0;
  const pendingCards = useLiveQuery(() => db.cards.where('status').equals('pending').count()) || 0;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
        📊 Thống Kê Kho Thẻ Căn Cước
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm border-l-4 border-l-blue-500 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-50 group-hover:bg-blue-200 transition-colors"></div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tổng thẻ trong kho</p>
          <p className="text-2xl font-black text-blue-900">{totalCards}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm border-l-4 border-l-indigo-500 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-50 group-hover:bg-indigo-200 transition-colors"></div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nhận vào hôm nay</p>
          <p className="text-2xl font-black text-indigo-900">{todayImport}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm border-l-4 border-l-green-500 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-green-50 group-hover:bg-green-200 transition-colors"></div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Đã trả công dân</p>
          <p className="text-2xl font-black text-green-600">{returnedCards}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm border-l-4 border-l-red-500 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-red-50 group-hover:bg-red-200 transition-colors"></div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Còn lại chưa trả</p>
          <p className="text-2xl font-black text-red-600">{pendingCards}</p>
        </div>
      </div>
    </div>
  );
}