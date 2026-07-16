// src/components/UnissuedDataTable.tsx
"use client";

import React from "react";
import { useUnissuedCards } from "@/hooks/useUnissuedCards";
import Toast from "./Toast";

export default function UnissuedDataTable() {
  const {
    records, formData, handleInputChange, handleAddRecord,
    requestDelete, confirmDelete, cancelDelete, confirmingId,
    toasts
  } = useUnissuedCards();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden flex flex-col w-full relative">

      {/* HEADER & FORM NHẬP LIỆU NHANH (GIỮ NGUYÊN) */}
      <div className="bg-orange-50 border-b border-orange-100 p-4">
        <h3 className="text-orange-800 font-bold text-sm mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          THEO DÕI CÔNG DÂN CÓ GIẤY HẸN NHƯNG CHƯA CÓ THẺ
        </h3>

        <form onSubmit={handleAddRecord} className="flex flex-col gap-3">
          <div className="grid xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-orange-700 mb-1">Số CCCD (*)</label>
              <input type="text" name="idNumber" value={formData.idNumber} onChange={handleInputChange} className="w-full px-3 py-2 border border-orange-200 rounded outline-none focus:ring-1 focus:ring-orange-500 text-sm" placeholder="Nhập số..." />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-orange-700 mb-1">Họ và Tên (*)</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-3 py-2 border border-orange-200 rounded outline-none focus:ring-1 focus:ring-orange-500 text-sm" placeholder="Nhập tên..." />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-orange-700 mb-1">Số Điện Thoại</label>
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-3 py-2 border border-orange-200 rounded outline-none focus:ring-1 focus:ring-orange-500 text-sm" placeholder="VD: 098..." />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-orange-700 mb-1">Địa Chỉ</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-3 py-2 border border-orange-200 rounded outline-none focus:ring-1 focus:ring-orange-500 text-sm" placeholder="Nhập địa chỉ..." />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-orange-700 mb-1">Ngày Hẹn</label>
              <input type="text" name="appointmentDate" value={formData.appointmentDate} onChange={handleInputChange} className="w-full px-3 py-2 border border-orange-200 rounded outline-none focus:ring-1 focus:ring-orange-500 text-sm" placeholder="VD: 15/07/2026" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-orange-700 mb-1">Lý do chưa cấp</label>
              <input type="text" name="reason" value={formData.reason} onChange={handleInputChange} className="w-full px-3 py-2 border border-orange-200 rounded outline-none focus:ring-1 focus:ring-orange-500 text-sm" placeholder="VD: Lỗi vân tay..." />
            </div>
          </div>

          <div className="flex justify-end mt-1">
            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded text-sm shadow-sm transition-colors">
              + Thêm vào danh sách
            </button>
          </div>
        </form>
      </div>

      {/* BẢNG HIỂN THỊ */}
      <div className="overflow-x-auto min-h-75">
        <table className="w-full text-xs text-left border-collapse text-gray-600 whitespace-nowrap">
          <thead className="bg-gray-100 text-gray-700 font-bold">
            <tr>
              <th className="px-3 py-3 w-12 text-center border-b">STT</th>
              <th className="px-3 py-3 border-b">Số CCCD</th>
              <th className="px-3 py-3 border-b">Họ và Tên</th>
              <th className="px-3 py-3 border-b">Điện Thoại</th>
              <th className="px-3 py-3 border-b max-w-50">Địa Chỉ</th>
              <th className="px-3 py-3 border-b">Ngày Hẹn</th>
              <th className="px-3 py-3 border-b">Lý do</th>
              <th className="px-3 py-3 text-center border-b w-20 sticky right-0 bg-gray-100">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!records || records.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400">Chưa có dữ liệu theo dõi.</td>
              </tr>
            ) : (
              records.map((item, index) => (
                <tr key={item.id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="px-3 py-2 text-center text-gray-400">{index + 1}</td>
                  <td className="px-3 py-2 font-bold text-blue-800">{item.idNumber}</td>
                  <td className="px-3 py-2 font-bold text-gray-800">{item.fullName}</td>
                  <td className="px-3 py-2 font-medium">{item.phoneNumber}</td>
                  <td className="px-3 py-2 truncate max-w-50" title={item.address}>{item.address}</td>
                  <td className="px-3 py-2 text-orange-700 font-medium">{item.appointmentDate}</td>
                  <td className="px-3 py-2 text-gray-500">{item.reason}</td>
                  <td className="px-3 py-2 text-center sticky right-0 bg-white group-hover:bg-orange-50/30 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">

                    <div className="flex justify-center relative">
                      {/* MINI POP-UP XÁC NHẬN XÓA */}
                      {confirmingId === item.id && (
                        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white border border-red-200 shadow-xl rounded-lg p-1.5 flex items-center gap-2 z-50 animate-in slide-in-from-right-2 fade-in duration-200">
                          <span className="text-[10px] text-red-600 font-bold whitespace-nowrap px-1">Xóa thẻ này?</span>
                          <button
                            onClick={() => { if (item.id !== undefined) confirmDelete(item.id) }}
                            className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded shadow-sm hover:bg-red-600"
                          >Xóa</button>
                          <button
                            onClick={cancelDelete}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded hover:bg-gray-200"
                          >Hủy</button>
                          {/* Mũi tên trỏ vào nút xóa */}
                          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white border-r border-t border-red-200 transform rotate-45"></div>
                        </div>
                      )}

                      {/* NÚT THÙNG RÁC MẶC ĐỊNH */}
                      <button
                        onClick={() => { if (item.id !== undefined) requestDelete(item.id) }}
                        className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 hover:bg-red-100 rounded transition-colors"
                        title="Xóa khỏi danh sách"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>

                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Toast toasts={toasts} />
    </div>
  );
}