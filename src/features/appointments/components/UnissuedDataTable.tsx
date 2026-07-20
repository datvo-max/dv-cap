// src/components/UnissuedDataTable.tsx
"use client";

import React from "react";
import { useUnissuedCards } from "@/features/appointments/hooks/useUnissuedCards";
import Toast from "@/shared/components/Toast";

export default function UnissuedDataTable() {
  const {
    records, formData, handleInputChange, handleAddRecord,
    requestDelete, confirmDelete, cancelDelete, confirmingId,
    toasts,
    handleUpdateResult,
    handleImageUpload,
    isScanningPhoto
  } = useUnissuedCards();

  const [editingResultId, setEditingResultId] = React.useState<number | null>(null);
  const [customResultText, setCustomResultText] = React.useState("");

  const suggestedReasons = React.useMemo(() => {
    const defaults = [
      "Sinh trắc không đạt",
      "Vân tay không đạt chuẩn",
      "Mống mắt không đạt chuẩn",
      "Hồ sơ chưa về"
    ];
    if (!records) return defaults;
    const dbReasons = records
      .map(r => r.reason)
      .filter((r): r is string => !!r && r !== "-");
    return Array.from(new Set([...defaults, ...dbReasons]));
  }, [records]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden flex flex-col w-full relative">
      {/* Khung ẩn dùng để xử lý đọc file ảnh tải lên ngầm */}
      <div id="unissued-file-scanner" className="hidden"></div>

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
              <input type="text" name="idNumber" value={formData.idNumber} onChange={handleInputChange} className="w-full px-3 py-2 border border-orange-200 rounded outline-none focus:ring-1 focus:ring-orange-500 text-sm bg-white font-medium" placeholder="Nhập số..." />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-orange-700 mb-1">Họ và Tên (*)</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-3 py-2 border border-orange-200 rounded outline-none focus:ring-1 focus:ring-orange-500 text-sm bg-white font-medium" placeholder="Nhập tên..." />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-orange-700 mb-1">Ngày Sinh</label>
              <input type="text" name="dob" value={formData.dob || ""} onChange={handleInputChange} className="w-full px-3 py-2 border border-orange-200 rounded outline-none focus:ring-1 focus:ring-orange-500 text-sm bg-white font-medium" placeholder="VD: 03/08/2015" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-orange-700 mb-1">Giới Tính</label>
              <input type="text" name="gender" value={formData.gender || ""} onChange={handleInputChange} className="w-full px-3 py-2 border border-orange-200 rounded outline-none focus:ring-1 focus:ring-orange-500 text-sm bg-white font-medium" placeholder="VD: Nam" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-orange-700 mb-1">Số Điện Thoại</label>
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-3 py-2 border border-orange-200 rounded outline-none focus:ring-1 focus:ring-orange-500 text-sm bg-white font-medium" placeholder="VD: 098..." />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-orange-700 mb-1">Địa Chỉ</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-3 py-2 border border-orange-200 rounded outline-none focus:ring-1 focus:ring-orange-500 text-sm bg-white font-medium" placeholder="Nhập địa chỉ..." />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-orange-700 mb-1">Ngày Hẹn</label>
              <input type="text" name="appointmentDate" value={formData.appointmentDate} onChange={handleInputChange} className="w-full px-3 py-2 border border-orange-200 rounded outline-none focus:ring-1 focus:ring-orange-500 text-sm bg-white font-medium" placeholder="VD: 15/07/2026" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-orange-700 mb-1">Lý do chưa cấp</label>
              <input
                type="text"
                name="reason"
                list="reasons-list"
                value={formData.reason}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-orange-200 rounded outline-none focus:ring-1 focus:ring-orange-500 text-sm bg-white font-medium"
                placeholder="VD: Lỗi vân tay..."
              />
              <datalist id="reasons-list">
                {suggestedReasons.map(r => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-1">
            <label className={`bg-white hover:bg-orange-50 text-orange-700 border border-orange-600 font-bold py-2 px-4 rounded text-sm shadow-sm transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 ${isScanningPhoto ? "opacity-60 pointer-events-none" : ""}`}>
              {isScanningPhoto ? "⏳ Đang quét..." : "📸 Đọc từ file ảnh"}
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={isScanningPhoto} />
            </label>
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
              <th className="px-3 py-3 border-b w-36">Kết quả xử lý</th>
              <th className="px-3 py-3 text-center border-b w-20 sticky right-0 bg-gray-100">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!records || records.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-10 text-gray-400">Chưa có dữ liệu theo dõi.</td>
              </tr>
            ) : (
              records.map((item, index) => (
                <tr key={item.id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="px-3 py-2.5 text-center text-gray-400">{index + 1}</td>
                  <td className="px-3 py-2.5 font-bold text-blue-800">{item.idNumber}</td>
                  <td className="px-3 py-2.5 font-bold text-gray-800">
                    <div>{item.fullName}</div>
                    {((item.dob && item.dob !== "-") || (item.gender && item.gender !== "-")) && (
                      <div className="text-[10px] text-gray-400 font-normal mt-0.5">
                        {item.dob && item.dob !== "-" ? `NS: ${item.dob}` : ""}
                        {item.dob && item.dob !== "-" && item.gender && item.gender !== "-" ? " • " : ""}
                        {item.gender && item.gender !== "-" ? `GT: ${item.gender}` : ""}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-medium">{item.phoneNumber}</td>
                  <td className="px-3 py-2.5 truncate max-w-50" title={item.address}>{item.address}</td>
                  <td className="px-3 py-2.5 text-orange-700 font-medium">{item.appointmentDate}</td>
                  <td className="px-3 py-2.5 text-gray-500">{item.reason}</td>
                  <td className="px-3 py-2.5">
                    {editingResultId === item.id ? (
                      <div className="flex items-center gap-1 animate-in fade-in duration-200">
                        <input
                          type="text"
                          value={customResultText}
                          onChange={(e) => setCustomResultText(e.target.value)}
                          placeholder="Nhập kết quả..."
                          className="px-2 py-1 border border-orange-300 rounded text-xs outline-none focus:ring-1 focus:ring-orange-500 w-28 bg-white font-medium"
                          autoFocus
                        />
                        <button
                          onClick={async () => {
                            await handleUpdateResult(item.id!, customResultText.trim() || "Chờ xử lý");
                            setEditingResultId(null);
                          }}
                          className="p-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-sm cursor-pointer"
                          title="Lưu"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </button>
                        <button
                          onClick={() => setEditingResultId(null)}
                          className="p-1 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
                          title="Hủy"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                    ) : (
                      <select
                        value={item.result || "Chờ xử lý"}
                        onChange={async (e) => {
                          const val = e.target.value;
                          if (val === "__custom__") {
                            setEditingResultId(item.id!);
                            setCustomResultText(item.result || "");
                          } else {
                            await handleUpdateResult(item.id!, val);
                          }
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border outline-none cursor-pointer transition-colors ${(item.result || "Chờ xử lý") === "Chờ xử lý"
                            ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                            : ["Đã đi làm lại", "Đã gửi yêu cầu lại"].includes(item.result || "")
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          }`}
                      >
                        <option value="Chờ xử lý">Chờ xử lý</option>
                        <option value="Đã đi làm lại">Đã đi làm lại</option>
                        <option value="Đã gửi yêu cầu lại">Đã gửi yêu cầu lại</option>
                        {item.result && !["Chờ xử lý", "Đã đi làm lại", "Đã gửi yêu cầu lại"].includes(item.result) && (
                          <option value={item.result}>{item.result}</option>
                        )}
                        <option value="__custom__">✍️ Tự nhập...</option>
                      </select>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center sticky right-0 bg-white group-hover:bg-orange-50/30 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">

                    <div className="flex justify-center relative">
                      {/* MINI POP-UP XÁC NHẬN XÓA */}
                      {confirmingId === item.id && (
                        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white border border-red-200 shadow-xl rounded-lg p-1.5 flex items-center gap-2 z-50 animate-in slide-in-from-right-2 fade-in duration-200">
                          <span className="text-[10px] text-red-600 font-bold whitespace-nowrap px-1">Xóa thẻ này?</span>
                          <button
                            onClick={() => { if (item.id !== undefined) confirmDelete(item.id) }}
                            className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-md shadow-sm hover:bg-red-600 cursor-pointer"
                          >Xóa</button>
                          <button
                            onClick={cancelDelete}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md hover:bg-gray-200 cursor-pointer"
                          >Hủy</button>
                          {/* Mũi tên trỏ vào nút xóa */}
                          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white border-r border-t border-red-200 transform rotate-45"></div>
                        </div>
                      )}

                      {/* NÚT THÙNG RÁC MẶC ĐỊNH */}
                      <button
                        onClick={() => { if (item.id !== undefined) requestDelete(item.id) }}
                        className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
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