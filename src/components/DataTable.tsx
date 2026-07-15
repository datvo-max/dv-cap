// src/components/DataTable.tsx
import { ScannedRecord } from "@/lib/db";
import { useState } from "react";

interface DataTableProps {
  data: ScannedRecord[];
  onDeleteRow: (id: number) => void;
}

export default function DataTable({ data, onDeleteRow }: DataTableProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | undefined>(undefined);

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border text-center text-gray-400 font-medium">
        📂 Chưa có dữ liệu được quét. Vui lòng bật camera hoặc sử dụng máy quét vật lý.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse text-gray-600 whitespace-nowrap">
          {/* GIẢM PADDING TIÊU ĐỀ */}
          <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-center w-10">STT</th>
              <th className="px-3 py-2">Số ĐDCN</th>
              <th className="px-3 py-2">Họ và Tên</th>
              <th className="px-3 py-2">Ngày Sinh</th>
              <th className="px-3 py-2">Giới Tính</th>
              <th className="px-3 py-2 max-w-xs overflow-hidden text-ellipsis">Địa Chỉ Thường Trú</th>
              <th className="px-3 py-2">Ngày Cấp</th>
              <th className="px-3 py-2">Số ĐDCN Đã Huỷ</th>
              <th className="px-3 py-2">Họ Tên Cha</th>
              <th className="px-3 py-2">Họ Tên Mẹ</th>
              <th className="px-3 py-2 text-center w-16 sticky right-0 bg-gray-50 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">Thao tác</th>
            </tr>
          </thead>
          {/* GIẢM THỂ TÍCH DÒNG (DÂY LÀ PHẦN THU GỌN MARGIN/PADDING CỦA DÒNG) */}
          <tbody className="divide-y divide-gray-100 font-medium">
            {data.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-3 py-1.5 text-center text-gray-400 font-normal">{index + 1}</td>
                <td className="px-3 py-1.5 font-bold text-blue-900">{item.idNumber}</td>
                <td className="px-3 py-1.5 font-bold text-gray-900">{item.fullName}</td>
                <td className="px-3 py-1.5 text-gray-700">{item.dob}</td>
                <td className="px-3 py-1.5 text-gray-700">{item.gender}</td>
                <td className="px-3 py-1.5 max-w-xs overflow-hidden text-ellipsis text-gray-500 font-normal" title={item.address}>
                  {item.address}
                </td>
                <td className="px-3 py-1.5 text-gray-700">{item.issueDate}</td>
                <td className="px-3 py-1.5 text-gray-600">{item.canceledIdNumber || "-"}</td>
                <td className="px-3 py-1.5 text-gray-600">{item.fatherName || "-"}</td>
                <td className="px-3 py-1.5 text-gray-600">{item.motherName || "-"}</td>

                <td className="px-3 py-1.5 text-center relative right-0 bg-white shadow-[-4px_0_10px_rgba(0,0,0,0.02)] transition-colors">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Xóa hồ sơ này"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    {confirmDeleteId === item.id && (
                      <div className="absolute right-10 z-40 bg-white border border-gray-200 rounded-lg shadow-xl p-2 flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-150">
                        <span className="text-[12px] font-bold text-gray-700 whitespace-nowrap">Xóa?</span>
                        <button
                          onClick={() => {
                            onDeleteRow(item.id!);
                            setConfirmDeleteId(undefined);
                          }}
                          className="px-1.5 py-0.5 text-[12px] font-bold text-white bg-red-600 rounded hover:bg-red-700 transition"
                        >
                          Có
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(undefined)}
                          className="px-1.5 py-0.5 text-[12px] font-bold text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition"
                        >
                          Không
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}