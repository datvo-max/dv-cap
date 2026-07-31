import * as XLSX from 'xlsx-js-style';
import { ArchiveRecord } from '@/shared/lib/db';

export function exportArchivesToExcel(data: ArchiveRecord[]) {
  if (data.length === 0) {
    alert("Không có dữ liệu để xuất Excel");
    return;
  }

  const exportData = data.map((item, index) => ({
    'STT': index + 1,
    'Số ĐDCN': item.idNumber,
    'Họ và tên': item.fullName,
    'Ngày sinh': item.dob?.length === 8 ? `${item.dob.substring(0,2)}-${item.dob.substring(2,4)}-${item.dob.substring(4,8)}` : item.dob?.replace(/\//g, '-'),
    'Giới tính': item.gender,
    'Số điện thoại': item.phoneNumber || '',
    'Nơi cư trú': item.address,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  
  const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1:A1");
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cellAddress]) continue;

      worksheet[cellAddress].s = {
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
  }

  // Chỉnh kích thước cột
  worksheet['!cols'] = [
    { wch: 5 },   // STT
    { wch: 20 },  // Số ĐDCN
    { wch: 30 },  // Họ và tên
    { wch: 15 },  // Ngày sinh
    { wch: 10 },  // Giới tính
    { wch: 15 },  // Số điện thoại
    { wch: 50 },  // Nơi cư trú
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Danh_sach_Tang_thu");
  
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Danh_Sach_Tang_Thu_${dateStr}.xlsx`);
}
