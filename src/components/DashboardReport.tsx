// src/components/DashboardReport.tsx
"use client";

import React, { useEffect, useState } from "react";

interface ReportItem {
  label: string;
  value: string;
}

export default function DashboardReport() {
  const [reportData, setReportData] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ⚠️ THAY ĐƯỜNG LINK CSV CỦA BẠN VÀO ĐÂY
  const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSf6KPgFPaNF-PU4zok3SzycUrhEWaLXt-cb2-ZDi_kO7vkhQKPa3s_GLVIj_nUO617oxXqCbytoTUR/pub?gid=0&single=true&output=csv";

  useEffect(() => {
    const fetchReport = async () => {
      // Bỏ qua nếu chưa điền link
      if (!GOOGLE_SHEET_CSV_URL || GOOGLE_SHEET_CSV_URL.includes("2PACX-...")) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(GOOGLE_SHEET_CSV_URL);
        const csvText = await res.text();

        const rows = csvText.split("\n");
        const parsedData: ReportItem[] = [];

        rows.forEach((row) => {
          const columns = row.split(",");
          // Đảm bảo dòng có đủ 2 cột (Tên chỉ số và Giá trị)
          if (columns[0] && columns[1]) {
            parsedData.push({
              label: columns[0].trim().replace(/"/g, ""), // Xóa dấu ngoặc kép thừa
              value: columns[1].trim().replace(/"/g, ""),
            });
          }
        });

        setReportData(parsedData);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu từ Google Sheet:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  // Hiệu ứng đang tải (Skeleton loading)
  if (loading) {
    return (
      <div className="w-full bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6 flex justify-center">
        <span className="text-gray-500 font-medium animate-pulse flex items-center gap-2">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Đang tải số liệu báo cáo...
        </span>
      </div>
    );
  }

  // Ẩn component nếu mảng dữ liệu trống (chưa có file sheet hoặc file rỗng)
  if (reportData.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
        📊 Thống kê
      </h3>

      {/* Lưới hiển thị các thẻ số liệu */}
      {/* Đã chuyển từ "grid" sang "flex" kết hợp lg:justify-center để dồn các thẻ ra giữa màn hình máy tính */}
      <div className="flex flex-wrap gap-3 lg:justify-center">
        {reportData.map((item, index) => (
          <div
            key={index}
            // w-[calc...] giữ 2 cột trên mobile
            // sm:w-auto sm:min-w-[150px] giúp các thẻ co giãn vừa phải
            // lg:text-center giúp toàn bộ chữ bên trong ô được đưa ra giữa
            className="grow sm:grow-0 w-[calc(50%-0.375rem)] sm:w-auto sm:min-w-37.5 lg:min-w-45 bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group text-left lg:text-center flex flex-col justify-center"
          >
            {/* Thanh màu trang trí nhỏ ở mép dưới thẻ */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-100 group-hover:bg-blue-500 transition-colors"></div>

            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 line-clamp-1" title={item.label}>
              {item.label}
            </p>
            <p className="text-2xl font-black text-blue-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}