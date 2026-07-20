// src/hooks/useCardImport.ts
import { useState, useRef } from "react";
import { db, CardRecord, addCardHistory, addCardHistoryBulk } from "@/shared/lib/db";
import { parseCCCD } from "@/shared/utils/cccdParser";
import * as XLSX from "xlsx"; // Nhớ import thư viện XLSX
import { useLiveQuery } from "dexie-react-hooks";

export function useCardImport(showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void) {

  const [isNoPhotoImport, setIsNoPhotoImport] = useState(false);
  const isNoPhotoImportRef = useRef(false);

  const setNoPhotoWrapper = (val: boolean) => {
    setIsNoPhotoImport(val);
    isNoPhotoImportRef.current = val;
  };

  const [isForceNextBox, setIsForceNextBox] = useState(false);
  const forceNextBoxRef = useRef(false);
  
  const handleForceNextBox = () => {
    setIsForceNextBox(true);
    forceNextBoxRef.current = true;
    showToast("📦 Đã ghi nhận! Lượt nạp tiếp theo sẽ tự động chuyển sang hộp mới.", "info");
  };

  // Tính hộp sẽ lưu thẻ trong lần quét tiếp theo
  const nextBoxName = useLiveQuery(async () => {
    const allCards = await db.cards.toArray();
    const relevantCards = allCards.filter(c => !!c.isNoPhoto === isNoPhotoImport);

    let maxZoneNum = 1;
    relevantCards.forEach(c => {
      const num = parseInt(String(c.zone).replace(/\D/g, "")) || 1;
      if (num > maxZoneNum) maxZoneNum = num;
    });

    const targetZoneStr = isNoPhotoImport ? `K${maxZoneNum}` : `${maxZoneNum}`;
    const cardsInMaxZone = relevantCards.filter(c => String(c.zone) === targetZoneStr).length;

    let finalZoneNum = maxZoneNum;
    if (cardsInMaxZone >= 50 || (isForceNextBox && cardsInMaxZone > 0)) {
      finalZoneNum = maxZoneNum + 1;
    }

    return isNoPhotoImport ? `K${finalZoneNum}` : `${finalZoneNum}`;
  }, [isNoPhotoImport, isForceNextBox]) || (isNoPhotoImport ? "K1" : "1");

  // ==========================================
  // 2. LOGIC ĐỌC FILE EXCEL & CHIA VÙNG (GIỮ NGUYÊN THỨ TỰ)
  // ==========================================
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast("Đang nạp dữ liệu từ Excel...", "warning");
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as Record<string, string | number>[];

        const today = new Date().toISOString().split('T')[0];

        // ==========================================
        // THUẬT TOÁN TÍNH HỘP THÔNG MINH (CHO EXCEL)
        // ==========================================
        const normalCards = await db.cards.filter(c => !c.isNoPhoto).toArray();
        let maxZoneNum = 1;
        normalCards.forEach(c => {
          const num = parseInt(String(c.zone).replace(/\D/g, "")) || 1;
          if (num > maxZoneNum) maxZoneNum = num;
        });

        // Xem hộp to nhất đang có bao nhiêu thẻ
        let currentZoneCount = normalCards.filter(c => String(c.zone) === `${maxZoneNum}`).length;

        // Nếu có lệnh Ép sang hộp mới từ trước khi nạp Excel
        if (forceNextBoxRef.current && currentZoneCount > 0) {
          maxZoneNum++;
          currentZoneCount = 0;
          forceNextBoxRef.current = false;
          setIsForceNextBox(false);
        }

        let successCount = 0;
        const newRecords: CardRecord[] = [];

        // Duyệt theo ĐÚNG THỨ TỰ từ trên xuống dưới của file Excel
        for (const row of data) {
          const idNumber = String(row['Số CCCD'] || row['So CCCD'] || row['ID'] || '');
          if (!idNumber) continue;

          // Bỏ qua nếu đã tồn tại
          const isExist = await db.cards.where('idNumber').equals(idNumber).count();
          if (isExist > 0) continue;

          // Xếp hộp tự động: Đủ 50 thì nhảy hộp tiếp theo
          if (currentZoneCount >= 50) {
            maxZoneNum++;
            currentZoneCount = 0;
          }

          const zone = maxZoneNum;

          newRecords.push({
            importDate: today,
            status: 'pending' as const,
            zone: zone,
            idNumber: idNumber,
            fullName: row['Họ và Tên'] as string || row['Ho Ten'] as string || 'Chưa rõ',
            dob: row['Ngày Sinh'] as string || row['Ngay Sinh'] as string || '-',
            address: row['Địa Chỉ'] as string || row['Dia Chi'] as string || '-',
            type: "Thẻ Căn cước" as const,
            oldIdNumber: "-",
            gender: row['Giới Tính'] as string || row['Gioi Tinh'] as string || '-',
            issueDate: row['Ngày Cấp'] as string || row['Ngay Cap'] as string || '-',
            canceledIdNumber: "-",
            fatherName: row['Cha'] as string || row["Họ Tên Cha"] as string || "-",
            motherName: row['Mẹ'] as string || row["Me"] as string || row["Họ Tên Mẹ"] as string || "-",
            isNoPhoto: false
          });

          currentZoneCount++;
          successCount++;
        }

        if (newRecords.length > 0) {
          await db.cards.bulkAdd(newRecords);
          const historyEntries = newRecords.map(rec => ({
            idNumber: rec.idNumber,
            action: 'import' as const,
            details: `Nạp mới thẻ từ Excel vào Hộp ${rec.zone}`
          }));
          await addCardHistoryBulk(historyEntries);
          showToast(`✅ Đã thêm thành công ${successCount} thẻ vào hệ thống!`, "success");
        } else {
          showToast(`⚠️ Không có thẻ mới nào được nạp (hoặc bị trùng toàn bộ).`, "warning");
        }
      } catch {
        showToast("❌ Lỗi đọc file Excel. Vui lòng kiểm tra lại định dạng.", "error");
      }
      e.target.value = "";
    };
    reader.readAsArrayBuffer(file);
  };

  // ==========================================
  // 1A. LOGIC QUÉT NẠP THẺ LẺ VÀO KHO
  // ==========================================
  const processImportCard = async (rawData: string) => {
    const record = parseCCCD(rawData);

    // MỚI: Siết chặt kiểm tra bằng Regex (Phải là chuỗi có đúng 12 chữ số)
    const cccdRegex = /^\d{12}$/;

    if (!record.idNumber || !cccdRegex.test(record.idNumber)) {
      showToast("❌ Lỗi: Dữ liệu không hợp lệ! Vui lòng quét đúng mã QR của thẻ Căn cước!", "error");
      return;
    }

    const isExist = await db.cards.where('idNumber').equals(record.idNumber).count();
    if (isExist > 0) {
      showToast(`⚠️ Thẻ của ${record.fullName} (${record.idNumber}) đã có trong kho!`, "warning");
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const isNoPhoto = isNoPhotoImportRef.current;

    // ==========================================
    // THUẬT TOÁN TÍNH HỘP THÔNG MINH MỚI
    // ==========================================
    const allCards = await db.cards.toArray();
    // Lọc ra danh sách thẻ cùng loại (Cùng là Có ảnh, hoặc cùng là Không ảnh)
    const relevantCards = allCards.filter(c => !!c.isNoPhoto === isNoPhoto);

    // 1. Tìm tên Hộp đang lớn nhất hiện tại (VD: đang đến K5 thì max là 5)
    let maxZoneNum = 1;
    relevantCards.forEach(c => {
      const num = parseInt(String(c.zone).replace(/\D/g, "")) || 1;
      if (num > maxZoneNum) maxZoneNum = num;
    });

    // 2. Đếm xem Hộp lớn nhất đó đang chứa bao nhiêu thẻ rồi
    const targetZoneStr = isNoPhoto ? `K${maxZoneNum}` : `${maxZoneNum}`;
    const cardsInMaxZone = relevantCards.filter(c => String(c.zone) === targetZoneStr).length;

    let finalZoneNum = maxZoneNum;

    // 3. Quyết định sang hộp mới nếu: Hộp cũ đã đủ 50 thẻ, HOẶC có lệnh Ép sang hộp
    if (cardsInMaxZone >= 50 || (forceNextBoxRef.current && cardsInMaxZone > 0)) {
      finalZoneNum = maxZoneNum + 1;
      forceNextBoxRef.current = false; // Tắt cờ sau khi đã thực thi thành công
      setIsForceNextBox(false);
    }

    const finalZone = isNoPhoto ? `K${finalZoneNum}` : finalZoneNum;

    // Ghi vào IndexedDB
    await db.cards.add({
      importDate: today,
      status: 'pending',
      zone: finalZone,
      idNumber: record.idNumber,
      fullName: record.fullName,
      dob: record.dob,
      address: record.address,
      type: "Thẻ Căn cước",
      oldIdNumber: record.oldIdNumber || "-",
      gender: record.gender || "-",
      issueDate: record.issueDate || "-",
      canceledIdNumber: record.canceledIdNumber || "-",
      fatherName: record.fatherName || "-",
      motherName: record.motherName || "-",
      isNoPhoto: isNoPhoto
    });

    await addCardHistory(record.idNumber, record.idNumber ? 'import' : 'import', `Quét nạp thẻ lẻ vào Hộp ${finalZone}`);

    showToast(`✅ Đã nạp thẻ: ${record.fullName} (Vị trí: Hộp ${finalZone})`, "success");
  };

  // Hàm phụ trợ xử lý Enter từ máy quét
  const handleImportScannerInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = e.currentTarget.value;
      if (val) {
        processImportCard(val);
        e.currentTarget.value = "";
      }
    }
  };


  return {
    isNoPhotoImport,
    setIsNoPhotoImport: setNoPhotoWrapper,
    handleForceNextBox,
    handleImportExcel,
    handleImportScannerInput,
    processImportCard,
    isForceNextBox,
    nextBoxName
  };
}