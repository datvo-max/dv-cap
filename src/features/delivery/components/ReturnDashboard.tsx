// src/components/ReturnDashboard.tsx
"use client";

import React from "react";
import { db } from "@/shared/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export default function ReturnDashboard() {
  const todayString = new Date().toISOString().split('T')[0];

  // 1. Tổng thẻ trong kho
  const totalCards = useLiveQuery(() => db.cards.count()) || 0;

  // 2. Nhận vào hôm nay
  const todayImport = useLiveQuery(() => db.cards.where('importDate').equals(todayString).count()) || 0;

  // 3. Còn lại chưa trả
  const pendingCards = useLiveQuery(() => db.cards.where('status').equals('pending').count()) || 0;

  // 4. Đã trả hôm nay (Tính toán qua Timestamp)
  const returnedCardsToday = useLiveQuery(async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return await db.cards
      .where('status')
      .equals('returned')
      .filter(card => {
        return !!card.returnedAt && card.returnedAt >= startOfDay.getTime() && card.returnedAt <= endOfDay.getTime();
      })
      .count();
  }) || 0;

  // 5. MỚI: Tổng số thẻ đã trả (Toàn thời gian)
  const totalReturnedCards = useLiveQuery(() => db.cards.where('status').equals('returned').count()) || 0;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
        📊 Thống Kê Kho Thẻ Căn Cước
      </h3>

      {/* CẬP NHẬT: Đổi từ md:grid-cols-4 thành xl:grid-cols-5 để 5 ô hiển thị cân đối trên PC */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">

        {/* Ô 1: Tổng thẻ trong kho (Blue) */}
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm border-l-4 border-l-blue-500 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-50 group-hover:bg-blue-200 transition-colors"></div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tổng thẻ trong kho</p>
          <p className="text-2xl font-black text-blue-900">{totalCards}</p>
        </div>

        {/* Ô 2: Nhận vào hôm nay (Indigo) */}
        <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm border-l-4 border-l-indigo-500 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-50 group-hover:bg-indigo-200 transition-colors"></div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nhận vào hôm nay</p>
          <p className="text-2xl font-black text-indigo-900">{todayImport}</p>
        </div>

        {/* Ô 3: Đã trả hôm nay (Green) */}
        <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm border-l-4 border-l-green-500 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-green-50 group-hover:bg-green-200 transition-colors"></div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Đã trả hôm nay</p>
          <p className="text-2xl font-black text-green-600">{returnedCardsToday}</p>
        </div>

        {/* Ô 4: MỚI - Tổng thẻ đã trả (Purple) */}
        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm border-l-4 border-l-purple-500 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-50 group-hover:bg-purple-200 transition-colors"></div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tổng thẻ đã trả</p>
          <p className="text-2xl font-black text-purple-700">{totalReturnedCards}</p>
        </div>

        {/* Ô 5: Còn lại chưa trả (Red) */}
        <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm border-l-4 border-l-red-500 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-red-50 group-hover:bg-red-200 transition-colors"></div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Còn lại chưa trả</p>
          <p className="text-2xl font-black text-red-600">{pendingCards}</p>
        </div>

      </div>
    </div>
  );
}