"use client";

import React, { useState, useMemo } from "react";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

interface ReturnDataTableProps {
  onReturnCard: (idNumber: string) => void;
}

export default function ReturnDataTable({ onReturnCard }: ReturnDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Lấy toàn bộ dữ liệu từ kho, sắp xếp theo Vị trí Hộp tăng dần
  const allCards = useLiveQuery(() => db.cards.orderBy('zone').toArray());

  // Bộ lọc tìm kiếm Instant (lọc ngay khi gõ)
  const filteredData = useMemo(() => {
    if (!allCards) return [];
    if (!searchTerm) return allCards;

    const lowerTerm = searchTerm.toLowerCase().trim();
    return allCards.filter(item =>
      item.fullName.toLowerCase().includes(lowerTerm) ||
      item.idNumber.includes(lowerTerm) ||
      item.zone.toString() === lowerTerm.replace("hộp ", "").replace("hop ", "").trim()
    );
  }, [allCards, searchTerm]);

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden w-full flex flex-col">
      {/* THANH TÌM KIẾM */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Tra cứu nhanh theo Tên, Số CCCD hoặc Vị trí (VD: Hộp 3)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto max-h-150">
        <table className="w-full text-xs text-left border-collapse text-gray-600 whitespace-nowrap relative">
          <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-3 py-2 text-center w-10">STT</th>
              <th className="px-3 py-2">Vị trí</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2">Số CCCD</th>
              <th className="px-3 py-2">Họ và Tên</th>
              <th className="px-3 py-2">Ngày Sinh</th>
              <th className="px-3 py-2 max-w-xs">Địa Chỉ</th>
              <th className="px-3 py-2 text-center w-24 sticky right-0 bg-gray-100 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {!filteredData || filteredData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400">
                  {searchTerm ? "Không tìm thấy hồ sơ nào khớp với từ khóa." : "Kho thẻ hiện đang trống. Vui lòng nạp dữ liệu từ Excel."}
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => {
                const isReturned = item.status === 'returned';

                return (
                  <tr key={item.id} className={`transition-colors ${isReturned ? 'bg-gray-50 opacity-60' : 'hover:bg-indigo-50/40'}`}>
                    <td className="px-3 py-2 text-center text-gray-400">{index + 1}</td>

                    {/* CỘT VỊ TRÍ HỘP */}
                    <td className="px-3 py-2 font-bold text-indigo-700">
                      Hộp {item.zone}
                    </td>

                    {/* CỘT TRẠNG THÁI */}
                    <td className="px-3 py-2">
                      {isReturned ? (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px] font-bold">Đã trả</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold animate-pulse">Chưa trả</span>
                      )}
                    </td>

                    <td className="px-3 py-2 font-bold text-blue-900">{item.idNumber}</td>
                    <td className="px-3 py-2 font-bold text-gray-900">{item.fullName}</td>
                    <td className="px-3 py-2 text-gray-700">{item.dob}</td>
                    <td className="px-3 py-2 max-w-50 overflow-hidden text-ellipsis text-gray-500 font-normal" title={item.address}>
                      {item.address}
                    </td>

                    <td className="px-3 py-2 text-center relative sticky right-0 bg-white group-hover:bg-indigo-50/40 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] transition-colors">
                      <div className="flex items-center justify-center">
                        {/* NÚT TRẢ THẺ */}
                        {!isReturned ? (
                          <button
                            onClick={() => onReturnCard(item.idNumber)}
                            className="px-3 py-1 bg-green-500 text-white text-[10px] font-bold rounded shadow-sm hover:bg-green-600 hover:shadow transform hover:scale-105 transition-all"
                            title="Xác nhận đã trả thẻ này cho công dân"
                          >
                            Xác nhận trả
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic" title={`Đã trả lúc: ${item.returnedAt}`}>
                            Đã xử lý
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}