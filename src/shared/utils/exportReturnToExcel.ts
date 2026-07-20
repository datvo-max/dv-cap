// src/utils/exportReturnToExcel.ts
import * as XLSX from 'xlsx-js-style';
import { CardRecord } from '@/shared/lib/db';

const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 10));

// ĐỊNH NGHĨA CẤU TRÚC CÁC TRƯỜNG DỮ LIỆU ĐỂ MODAL VÀ EXCEL CÙNG SỬ DỤNG
export const COLUMNS_SCHEMA = [
  { key: 'stt', label: 'STT', defaultChecked: true, wch: 6 },
  { key: 'zone', label: 'Vị Trí Hộp', defaultChecked: false, wch: 12 },
  { key: 'idNumber', label: 'Số CCCD', defaultChecked: true, wch: 16 },
  { key: 'fullName', label: 'Họ và Tên', defaultChecked: true, wch: 28 },
  { key: 'phoneNumber', label: 'Số Điện Thoại', defaultChecked: false, wch: 15 },
  { key: 'dob', label: 'Ngày Sinh', defaultChecked: false, wch: 12 },
  { key: 'address', label: 'Địa Chỉ', defaultChecked: true, wch: 35 },
  { key: 'fatherName', label: 'Họ Tên Cha', defaultChecked: false, wch: 25 },
  { key: 'motherName', label: 'Họ Tên Mẹ', defaultChecked: false, wch: 25 },
  { key: 'importDate', label: 'Ngày Nhận', defaultChecked: true, wch: 15 },
  { key: 'status', label: 'Trạng Thái', defaultChecked: true, wch: 12 },
  { key: 'returnedAt', label: 'Thời Gian Trả', defaultChecked: true, wch: 20 },
  { key: 'shipperName', label: 'Tên Shipper', defaultChecked: false, wch: 20 },
  { key: 'shipperPhone', label: 'SĐT Shipper', defaultChecked: false, wch: 15 },
  { key: 'shippedAt', label: 'Thời Gian Chuyển', defaultChecked: false, wch: 20 }
];

export const exportReturnExcel = async (
  data: CardRecord[],
  type: 'all' | 'returned' | 'pending' | 'selected',
  selectedKeys: string[],
  onProgress: (percent: number) => void
): Promise<void> => {
  if (data.length === 0) throw new Error("Chưa có dữ liệu để xuất!");

  onProgress(5);
  await yieldToMain();

  const activeSchema = COLUMNS_SCHEMA.filter(col => selectedKeys.includes(col.key));
  const MAX_RECORDS_PER_FILE = 5000;
  const totalFiles = Math.ceil(data.length / MAX_RECORDS_PER_FILE);

  // HÀM HỖ TRỢ: TẠO SHEET ĐỘNG (Áp dụng chung cho Sheet Tổng và Sheet Ngày)
  const buildSheet = async (subsetData: CardRecord[], startIndex: number, sheetProgressWeight: number, currentProgress: number) => {
    const dataToExport = subsetData.map((item, index) => {
      const rowData: Record<string, unknown> = {};

      activeSchema.forEach(col => {
        if (col.key === 'stt') rowData[col.label] = startIndex + index + 1;
        if (col.key === 'zone') rowData[col.label] = String(item.zone).includes('K') ? `Hộp ${item.zone}` : `Hộp số ${item.zone}`;
        if (col.key === 'idNumber') rowData[col.label] = item.idNumber;
        if (col.key === 'fullName') rowData[col.label] = item.fullName + (item.isNoPhoto ? ' (K.Ảnh)' : '');
        if (col.key === 'phoneNumber') rowData[col.label] = item.phoneNumber || "-";
        if (col.key === 'dob') rowData[col.label] = item.dob;
        if (col.key === 'address') rowData[col.label] = item.address;
        if (col.key === 'fatherName') rowData[col.label] = item.fatherName || "-";
        if (col.key === 'motherName') rowData[col.label] = item.motherName || "-";
        if (col.key === 'importDate') rowData[col.label] = item.importDate;
        if (col.key === 'status') {
          rowData[col.label] = item.status === 'returned' ? 'Đã trả' : (item.status === 'shipping' ? 'Đang giao' : 'Chưa trả');
        }
        if (col.key === 'returnedAt') rowData[col.label] = item.returnedAt ? new Date(item.returnedAt).toLocaleString('vi-VN') : '-';
        if (col.key === 'shipperName') rowData[col.label] = item.shipperName || "-";
        if (col.key === 'shipperPhone') rowData[col.label] = item.shipperPhone || "-";
        if (col.key === 'shippedAt') rowData[col.label] = item.shippedAt ? new Date(item.shippedAt).toLocaleString('vi-VN') : '-';
      });
      return rowData;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);

    // Set độ rộng cột linh hoạt theo các trường đã chọn
    ws['!cols'] = activeSchema.map(col => ({ wch: col.wch }));

    // AutoFilter
    const range = XLSX.utils.decode_range(ws['!ref'] || "A1:A1");
    if (range.e.r > 0 && range.e.c > 0) {
      ws['!autofilter'] = { ref: XLSX.utils.encode_range(range) };
    }

    const totalRows = range.e.r - range.s.r + 1;
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;

        ws[cellAddress].s = {
          font: { name: "Times New Roman", sz: 12, bold: R === 0 },
          border: {
            top: { style: "thin", color: { rgb: "000000" } }, bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } }, right: { style: "thin", color: { rgb: "000000" } }
          },
          alignment: { wrapText: true, vertical: "center", horizontal: R === 0 ? "center" : "left" }
        };
      }

      if (R % 100 === 0 || R === range.e.r) {
        const innerProgress = (R / totalRows) * sheetProgressWeight;
        onProgress(Math.floor(currentProgress + innerProgress));
        await yieldToMain();
      }
    }
    return ws;
  };

  for (let fileIndex = 0; fileIndex < totalFiles; fileIndex++) {
    const workbook = XLSX.utils.book_new();
    const startIdx = fileIndex * MAX_RECORDS_PER_FILE;
    const endIdx = Math.min(startIdx + MAX_RECORDS_PER_FILE, data.length);
    const chunkData = data.slice(startIdx, endIdx);

    const baseProgress = (fileIndex / totalFiles) * 100;
    const chunkWeight = 100 / totalFiles;

    // --- 1. TẠO SHEET TỔNG ---
    const wsMaster = await buildSheet(chunkData, startIdx, chunkWeight * 0.4, baseProgress);
    XLSX.utils.book_append_sheet(workbook, wsMaster, "DanhSachTong");

    // --- 2. TẠO 7 SHEET THEO NGÀY (Chỉ khi xuất danh sách Đã Trả) ---
    if (type === 'returned') {
      // Phân bổ 50% thanh progress còn lại cho 7 sheet ngày
      const sheetDayWeight = (chunkWeight * 0.5) / 7;
      let currentProgress = baseProgress + (chunkWeight * 0.4);

      for (let i = 0; i < 7; i++) {
        // Xác định chính xác khung thời gian của ngày đó
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - i);

        targetDate.setHours(0, 0, 0, 0);
        const startOfDay = targetDate.getTime();

        targetDate.setHours(23, 59, 59, 999);
        const endOfDay = targetDate.getTime();

        const dd = String(targetDate.getDate()).padStart(2, '0');
        const mm = String(targetDate.getMonth() + 1).padStart(2, '0');

        // Lọc thẻ trả trong ngày đó bằng cách so sánh 2 con số Timestamp
        const dailyData = chunkData.filter(item => {
          return !!item.returnedAt && item.returnedAt >= startOfDay && item.returnedAt <= endOfDay;
        });

        if (dailyData.length > 0) {
          const wsDaily = await buildSheet(dailyData, 0, sheetDayWeight, currentProgress);
          XLSX.utils.book_append_sheet(workbook, wsDaily, `${dd}_${mm}`);
        } else {
          currentProgress += sheetDayWeight;
          onProgress(Math.floor(currentProgress));
          await yieldToMain();
        }
      }
    } else {
      // Nếu không phải xuất danh sách đã trả thì đẩy progress lên max của chunk
      onProgress(Math.floor(baseProgress + (chunkWeight * 0.95)));
      await yieldToMain();
    }

    // Đặt tên file
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    let filename = `TanAn_Tong_So_The_Can_Cuoc_${dateStr}`;
    if (type === 'returned') filename = `TanAn_Danh_Sach_Da_Tra_${dateStr}`;
    if (type === 'pending') filename = `TanAn_Danh_Sach_Con_Lai_${dateStr}`;
    if (type === 'selected') filename = `TanAn_Danh_Sach_Da_Chon_${dateStr}`;
    if (totalFiles > 1) filename += `_Phan_${fileIndex + 1}`;
    filename += `.xlsx`;

    XLSX.writeFile(workbook, filename);
    if (fileIndex < totalFiles - 1) await new Promise(resolve => setTimeout(resolve, 500));
  }

  onProgress(100);
};