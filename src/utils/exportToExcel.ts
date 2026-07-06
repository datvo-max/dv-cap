// src/utils/exportExcel.ts
import * as XLSX from 'xlsx-js-style';
import { CCCDRecord } from '../types/cccd';

// Hàm ngắt nhịp để trình duyệt kịp cập nhật giao diện (Progress Bar)
const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 10));

export const exportToExcel = async (
  data: CCCDRecord[],
  onProgress: (percent: number) => void
): Promise<void> => {
  if (data.length === 0) throw new Error("Chưa có dữ liệu để xuất!");

  onProgress(10);
  await yieldToMain();

  // 1. Chuẩn bị dữ liệu (Chiếm 30% tiến trình)
  const dataToExport = data.map((item, index) => ({
    "STT": index + 1,
    "Loại Thẻ": item.type,
    "Số CCCD": item.idNumber,
    "Số CMND Cũ": item.oldIdNumber,
    "Họ và Tên": item.fullName,
    "Ngày Sinh": item.dob,
    "Giới Tính": item.gender,
    "Địa Chỉ": item.address,
    "Ngày Cấp": item.issueDate,
    "Họ Tên Vợ/Chồng": item.spouseName,
    "Họ Tên Cha": item.fatherName,
    "Họ Tên Mẹ": item.motherName
  }));

  const ws = XLSX.utils.json_to_sheet(dataToExport);

  onProgress(40);
  await yieldToMain();

  // 2. Thiết lập độ rộng cột
  ws['!cols'] = [
    { wch: 6 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 25 },
    { wch: 12 }, { wch: 10 }, { wch: 45 }, { wch: 12 }, { wch: 25 },
    { wch: 25 }, { wch: 25 }
  ];

  // 3. Định dạng Style (Đây là bước nặng nhất, chạy vòng lặp lớn)
  const range = XLSX.utils.decode_range(ws['!ref'] || "A1:A1");
  const totalRows = range.e.r - range.s.r + 1;

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;

      ws[cellAddress].s = {
        font: { name: "Times New Roman", sz: 12, bold: R === 0 },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        },
        alignment: { wrapText: true, vertical: "center", horizontal: R === 0 ? "center" : "left" }
      };
    }

    // Cập nhật progress bar mỗi khi xử lý được 100 dòng, hoặc khi hoàn thành
    if (R % 100 === 0 || R === range.e.r) {
      const currentProgress = 40 + Math.floor((R / totalRows) * 40); // Từ 40% -> 80%
      onProgress(currentProgress);
      await yieldToMain();
    }
  }

  onProgress(85);
  await yieldToMain();

  // 4. Khởi tạo file và tải xuống
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, ws, "DanhSachCCCD");

  onProgress(95);
  await yieldToMain();

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  XLSX.writeFile(workbook, `Danh_Sach_CCCD_${dateStr}.xlsx`);

  onProgress(100);
};