// src/utils/exportReturnExcel.ts
import * as XLSX from 'xlsx-js-style';
import { CardRecord } from '@/lib/db';

const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 10));

export const exportReturnExcel = async (
  data: CardRecord[],
  type: 'all' | 'returned' | 'pending',
  onProgress: (percent: number) => void
): Promise<void> => {
  if (data.length === 0) throw new Error("Chưa có dữ liệu để xuất!");

  onProgress(10);
  await yieldToMain();

  // 1. Chuẩn bị dữ liệu
  const dataToExport = data.map((item, index) => ({
    "STT": index + 1,
    "Vị Trí Hộp": `Hộp số ${item.zone}`,
    "Số CCCD": item.idNumber,
    "Họ và Tên": item.fullName,
    "Ngày Nạp": item.importDate,
    "Trạng Thái": item.status === 'returned' ? 'Đã trả' : 'Chưa trả',
    "Thời Gian Trả": item.returnedAt || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(dataToExport);

  onProgress(40);
  await yieldToMain();

  // 2. Thiết lập độ rộng cột
  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 15 }, // Vị Trí Hộp
    { wch: 16 }, // Số CCCD
    { wch: 25 }, // Họ và Tên
    { wch: 15 }, // Ngày Nạp
    { wch: 15 }, // Trạng Thái
    { wch: 25 }  // Thời Gian Trả
  ];

  // 3. Định dạng Style (Vòng lặp nặng ngắt nhịp)
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

    if (R % 100 === 0 || R === range.e.r) {
      const currentProgress = 40 + Math.floor((R / totalRows) * 40);
      onProgress(currentProgress);
      await yieldToMain();
    }
  }

  onProgress(85);
  await yieldToMain();

  // 4. Khởi tạo file và tải xuống
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, ws, "DanhSachTraThe");

  onProgress(95);
  await yieldToMain();

  // Đặt tên file linh hoạt theo nút bấm
  let filename = 'Tong_So_The_Can_Cuoc.xlsx';
  if (type === 'returned') filename = 'Danh_Sach_Da_Tra.xlsx';
  if (type === 'pending') filename = 'Danh_Sach_Con_Lai.xlsx';

  XLSX.writeFile(workbook, filename);
  onProgress(100);
};