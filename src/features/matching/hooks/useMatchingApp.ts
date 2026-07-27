// src/features/matching/hooks/useMatchingApp.ts
import { useState, useCallback, useEffect } from "react";
import { db, MatchingRecord, CardRecord, addCardHistory, addCardHistoryBulk } from "@/shared/lib/db";
import { parseCCCD } from "@/shared/utils/cccdParser";
import * as XLSX from "xlsx";
import { useLiveQuery } from "dexie-react-hooks";
import { Html5Qrcode } from "html5-qrcode";
import { useRef } from "react";

export function useMatchingApp() {
  const [selectedMatchedIds, setSelectedMatchedIds] = useState<number[]>([]);
  const [selectedUnmatchedIds, setSelectedUnmatchedIds] = useState<number[]>([]);

  const [isWebCamActive, setIsWebCamActive] = useState(false);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isCameraPaused = useRef(false);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<number | null>(null);

  interface ToastItem {
    id: number;
    msg: string;
    type: "success" | "error" | "warning" | "info";
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((msg: string, type: "success" | "error" | "warning" | "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const rawData = useLiveQuery(() => db.matchingCards.orderBy('id').reverse().toArray(), []);
  const matchingData = rawData || [];

  const matchedRecords = matchingData.filter(r => r.status === 'matched');
  const unmatchedRecords = matchingData.filter(r => r.status === 'unmatched');

  // Lấy dữ liệu thẻ gốc từ kho cho các thẻ matched
  const matchedCardsMap = useLiveQuery(async () => {
    if (!matchingData.length) return {};
    const matchedIds = matchingData.filter(r => r.status === 'matched' && r.matchedCardId).map(r => r.matchedCardId!);
    const cards = await db.cards.where('id').anyOf(matchedIds).toArray();
    return cards.reduce((acc, card) => {
      acc[card.id!] = card;
      return acc;
    }, {} as Record<number, any>);
  }, [matchingData]) || {};

  const normalizeStr = (val?: string) => {
    if (!val || val === "-" || val === "Chưa rõ") return "";
    return String(val).trim().toLowerCase();
  };

  const isIdenticalCard = (newRec: Record<string, any>, oldCard: CardRecord) => {
    const fields = ["fullName", "issueDate", "dob", "address", "gender", "fatherName", "motherName"] as const;
    return fields.every((f) => normalizeStr(newRec[f]) === normalizeStr(oldCard[f as keyof CardRecord] as string));
  };

  const processRecord = async (record: Omit<MatchingRecord, 'id' | 'status' | 'importedAt'>): Promise<'added' | 'skipped_identical'> => {
    // Tiêu chí đối sánh: idNumber VÀ issueDate
    const existingCards = await db.cards
      .where('idNumber')
      .equals(record.idNumber)
      .toArray();

    // Kiểm tra xem có thẻ nào trong kho giống hệt thông tin hay không
    const identicalCard = existingCards.find(c => isIdenticalCard(record, c));
    if (identicalCard) {
      return 'skipped_identical';
    }

    const exactMatch = existingCards.find(c => c.issueDate === record.issueDate) || existingCards[0];

    const matchEntry: MatchingRecord = {
      ...record,
      importedAt: Date.now(),
      status: exactMatch ? 'matched' : 'unmatched',
      matchedCardId: exactMatch ? exactMatch.id : undefined,
    };

    await db.matchingCards.add(matchEntry);
    return 'added';
  };

  const handleScanSuccess = async (decodedText: string) => {
    const record = parseCCCD(decodedText);
    if (!record.idNumber) {
      showToast(`❌ Lỗi: Mã QR không hợp lệ!`, "error");
      return;
    }
    try {
      const { id: _id, rawText: _rawText, type: _type, ...recordData } = record;
      void _id; void _rawText; void _type;

      const result = await processRecord({
        ...recordData,
        type: record.type === "Không hợp lệ" ? "Thẻ Căn cước" : record.type,
      } as Omit<MatchingRecord, 'id' | 'status' | 'importedAt'>);

      if (result === 'skipped_identical') {
        showToast(`⚠️ Thẻ ${record.fullName} không có thay đổi so với kho hiện tại, đã bỏ qua.`, "warning");
      } else {
        showToast(`✅ Đã nạp: ${record.fullName}`, "success");
      }
    } catch (error) {
      console.error(error);
      showToast("❌ Lỗi khi nạp dữ liệu quét!", "error");
    }
  };

  const handleScanSuccessRef = useRef(handleScanSuccess);
  useEffect(() => {
    handleScanSuccessRef.current = handleScanSuccess;
  });

  const handleCameraScan = (decodedText: string) => {
    if (isCameraPaused.current) return;
    isCameraPaused.current = true;
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 100);

    if (typeof navigator !== "undefined" && navigator && navigator.vibrate) {
      try {
        navigator.vibrate(150);
      } catch {
        // Bỏ qua nếu trình duyệt không hỗ trợ rung
      }
    }

    if (handleScanSuccessRef.current) {
      // Phải bắt lỗi Promise vì handleScanSuccess là async
      Promise.resolve(handleScanSuccessRef.current(decodedText)).catch((err) => {
        console.error("Lỗi xử lý QR (Phân hệ 4):", err);
        showToast("❌ Có lỗi xảy ra khi xử lý mã QR!", "error");
      });
    }

    setTimeout(() => {
      isCameraPaused.current = false;
    }, 2000);
  };

  const startWebcam = async () => {
    setIsWebCamActive(true);
    // Chờ DOM render phần tử #matching-reader — polling thay vì timeout cố định
    const waitForElement = (id: string, maxWait = 2000, interval = 100): Promise<boolean> => {
      return new Promise((resolve) => {
        const start = Date.now();
        const check = () => {
          if (document.getElementById(id)) return resolve(true);
          if (Date.now() - start >= maxWait) return resolve(false);
          setTimeout(check, interval);
        };
        check();
      });
    };

    const elementReady = await waitForElement('matching-reader');
    if (!elementReady) {
      showToast("Lỗi: Không tìm thấy khung camera. Vui lòng thử lại.", "error");
      setIsWebCamActive(false);
      return;
    }

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("matching-reader");
      }
      if (!html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          handleCameraScan,
          () => { }
        );
      }
    } catch (err) {
      console.warn("Lỗi phần cứng camera:", err);
      showToast("Lỗi mở camera! Vui lòng thử lại hoặc kiểm tra quyền truy cập.", "error");
      setIsWebCamActive(false);
    }
  };

  const stopWebcam = async () => {
    if (html5QrCodeRef.current?.isScanning) await html5QrCodeRef.current.stop();
    setIsWebCamActive(false);
  };

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

        let successCount = 0;
        let skippedCount = 0;

        for (const row of data) {
          const idNumber = String(row['Số CCCD'] || row['So CCCD'] || row['ID'] || '');
          if (!idNumber) continue;

          const recordData: Omit<MatchingRecord, 'id' | 'status' | 'importedAt'> = {
            idNumber,
            fullName: String(row['Họ và Tên'] || row['Ho Ten'] || 'Chưa rõ'),
            dob: String(row['Ngày Sinh'] || row['Ngay Sinh'] || '-'),
            gender: String(row['Giới Tính'] || row['Gioi Tinh'] || '-'),
            address: String(row['Địa Chỉ'] || row['Dia Chi'] || '-'),
            issueDate: String(row['Ngày Cấp'] || row['Ngay Cap'] || '-'),
            oldIdNumber: "-",
            canceledIdNumber: "-",
            fatherName: String(row['Cha'] || row['Họ Tên Cha'] || '-'),
            motherName: String(row['Mẹ'] || row['Me'] || row['Họ Tên Mẹ'] || '-'),
            type: "Thẻ Căn cước"
          };

          const res = await processRecord(recordData);
          if (res === 'skipped_identical') {
            skippedCount++;
          } else {
            successCount++;
          }
        }

        if (successCount > 0 && skippedCount > 0) {
          showToast(`✅ Đã nạp ${successCount} thẻ! (Bỏ qua ${skippedCount} thẻ giống hệt trong kho)`, "success");
        } else if (successCount > 0) {
          showToast(`✅ Đã nạp thành công ${successCount} thẻ để đối sánh!`, "success");
        } else if (skippedCount > 0) {
          showToast(`⚠️ Toàn bộ ${skippedCount} thẻ trong Excel giống hệt trong kho, đã bỏ qua!`, "warning");
        }
      } catch (err) {
        console.error(err);
        showToast("❌ Lỗi đọc file Excel.", "error");
      }
      e.target.value = "";
    };
    reader.readAsArrayBuffer(file);
  };

  const handleScannerInput = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.currentTarget.value) {
      e.preventDefault();
      handleScanSuccess(e.currentTarget.value);
      e.currentTarget.value = "";
    }
  };

  const updateField = async (matchingId: number, fieldName: keyof MatchingRecord, newValue: string) => {
    try {
      const matchRec = await db.matchingCards.get(matchingId);
      if (!matchRec || !matchRec.matchedCardId) return;

      const card = await db.cards.get(matchRec.matchedCardId);
      if (!card) return;

      const oldValue = card[fieldName as keyof typeof card];
      await db.cards.update(card.id!, { [fieldName]: newValue });
      await addCardHistory(card.idNumber, 'edit', `Cập nhật (Đối sánh): ${fieldName} từ "${oldValue}" -> "${newValue}"`);
      showToast(`✅ Cập nhật ${fieldName} thành công!`, "success");
    } catch (e) {
      console.error(e);
      showToast("❌ Cập nhật thất bại!", "error");
    }
  };

  const updateAllFields = async (matchingId: number) => {
    try {
      const matchRec = await db.matchingCards.get(matchingId);
      if (!matchRec || !matchRec.matchedCardId) return;

      const card = await db.cards.get(matchRec.matchedCardId);
      if (!card) return;

      const fieldsToUpdate = ['fullName', 'dob', 'address', 'gender', 'issueDate', 'fatherName', 'motherName'] as const;
      const updates: any = {};
      const changes: string[] = [];

      for (const field of fieldsToUpdate) {
        if (matchRec[field] && matchRec[field] !== '-' && matchRec[field] !== card[field as keyof typeof card]) {
          updates[field] = matchRec[field];
          changes.push(`${field}: "${card[field as keyof typeof card]}" -> "${matchRec[field]}"`);
        }
      }

      if (Object.keys(updates).length > 0) {
        await db.cards.update(card.id!, updates);
        await addCardHistory(card.idNumber, 'edit', `Cập nhật toàn bộ (Đối sánh): ${changes.join(', ')}`);
      }
      
      await db.matchingCards.update(matchingId, { status: 'resolved' });
      showToast("✅ Đã cập nhật thông tin mới vào Kho!", "success");
    } catch (e) {
      console.error(e);
      showToast("❌ Lỗi khi cập nhật thông tin!", "error");
    }
  };

  const updateSelectedFields = async (matchingId: number, selectedUpdates: Partial<CardRecord>) => {
    try {
      const matchRec = await db.matchingCards.get(matchingId);
      if (!matchRec || !matchRec.matchedCardId) return;

      const card = await db.cards.get(matchRec.matchedCardId);
      if (!card) return;

      if (Object.keys(selectedUpdates).length > 0) {
        const changes: string[] = [];
        for (const [key, val] of Object.entries(selectedUpdates)) {
          const oldVal = card[key as keyof typeof card];
          if (val !== oldVal) {
            changes.push(`${key}: "${oldVal || '-'}" -> "${val}"`);
          }
        }
        await db.cards.update(card.id!, selectedUpdates);
        if (changes.length > 0) {
          await addCardHistory(card.idNumber, 'edit', `Cập nhật chọn lọc (Đối sánh): ${changes.join(', ')}`);
        }
      }

      await db.matchingCards.update(matchingId, { status: 'resolved' });
      showToast("✅ Đã cập nhật các trường được chọn cho thẻ!", "success");
    } catch (e) {
      console.error(e);
      showToast("❌ Lỗi khi cập nhật thông tin chọn lọc!", "error");
    }
  };

  const resolveMatch = async (matchingId: number) => {
    try {
      await db.matchingCards.update(matchingId, { status: 'resolved' });
      showToast("✅ Đã xử lý xong thẻ này (Đã ẩn).", "success");
    } catch (e) {
      showToast("❌ Lỗi khi xác nhận thẻ.", "error");
    }
  };

  const bulkUpdateAllFields = async (ids: number[]) => {
    if (ids.length === 0) return;
    try {
      let successCount = 0;
      for (const id of ids) {
        const matchRec = await db.matchingCards.get(id);
        if (!matchRec || !matchRec.matchedCardId) continue;
        const card = await db.cards.get(matchRec.matchedCardId);
        if (!card) continue;
        
        const fieldsToUpdate = ['fullName', 'dob', 'address', 'gender', 'issueDate', 'fatherName', 'motherName'] as const;
        const updates: any = {};
        const changes: string[] = [];
        
        for (const field of fieldsToUpdate) {
          if (matchRec[field] && matchRec[field] !== '-' && matchRec[field] !== card[field as keyof typeof card]) {
            updates[field] = matchRec[field];
            changes.push(`${field}: "${card[field as keyof typeof card]}" -> "${matchRec[field]}"`);
          }
        }
        
        if (Object.keys(updates).length > 0) {
          await db.cards.update(card.id!, updates);
          await addCardHistory(card.idNumber, 'edit', `Cập nhật toàn bộ (Đối sánh): ${changes.join(', ')}`);
        }
        
        await db.matchingCards.update(id, { status: 'resolved' });
        successCount++;
      }
      setSelectedMatchedIds([]);
      showToast(`✅ Đã cập nhật thông tin mới cho ${successCount} thẻ!`, "success");
    } catch (e) {
      console.error(e);
      showToast("❌ Lỗi cập nhật hàng loạt!", "error");
    }
  };

  const bulkResolveMatch = async (ids: number[]) => {
    if (ids.length === 0) return;
    try {
      await db.matchingCards.where('id').anyOf(ids).modify({ status: 'resolved' });
      setSelectedMatchedIds([]);
      showToast(`✅ Đã giữ thông tin cũ cho ${ids.length} thẻ.`, "success");
    } catch (e) {
      showToast("❌ Lỗi xác nhận hàng loạt.", "error");
    }
  };

  const addToWarehouse = async (matchingId: number, zone: number | string) => {
    try {
      const matchRec = await db.matchingCards.get(matchingId);
      if (!matchRec) return;

      const today = new Date().toISOString().split('T')[0];
      await db.cards.add({
        importDate: today,
        status: 'pending',
        zone: zone,
        idNumber: matchRec.idNumber,
        fullName: matchRec.fullName,
        dob: matchRec.dob,
        address: matchRec.address,
        type: matchRec.type as any,
        oldIdNumber: matchRec.oldIdNumber,
        gender: matchRec.gender,
        issueDate: matchRec.issueDate,
        canceledIdNumber: matchRec.canceledIdNumber,
        fatherName: matchRec.fatherName,
        motherName: matchRec.motherName,
        isNoPhoto: false
      });
      await addCardHistory(matchRec.idNumber, 'import', `Nạp mới (Đối sánh) vào Hộp ${zone}`);
      await resolveMatch(matchingId);
      showToast(`✅ Đã thêm ${matchRec.fullName} vào Hộp ${zone}!`, "success");
    } catch (e) {
      showToast("❌ Lỗi thêm vào kho!", "error");
    }
  };

  const ignoreRecord = async (matchingId: number) => {
    await db.matchingCards.delete(matchingId);
    showToast("🗑️ Đã bỏ qua thẻ.", "info");
  };

  const bulkAddToWarehouse = async (ids: number[], zone: string | number) => {
    if (ids.length === 0) return;
    try {
      const records = await db.matchingCards.where('id').anyOf(ids).toArray();
      const today = new Date().toISOString().split('T')[0];
      const newCards = records.map(matchRec => ({
        importDate: today,
        status: 'pending' as const,
        zone: zone,
        idNumber: matchRec.idNumber,
        fullName: matchRec.fullName,
        dob: matchRec.dob,
        address: matchRec.address,
        type: matchRec.type as any,
        oldIdNumber: matchRec.oldIdNumber,
        gender: matchRec.gender,
        issueDate: matchRec.issueDate,
        canceledIdNumber: matchRec.canceledIdNumber,
        fatherName: matchRec.fatherName,
        motherName: matchRec.motherName,
        isNoPhoto: false
      }));
      
      await db.cards.bulkAdd(newCards);
      
      const historyEntries = records.map(matchRec => ({
        idNumber: matchRec.idNumber,
        action: 'import' as const,
        details: `Nạp mới hàng loạt (Đối sánh) vào Hộp ${zone}`
      }));
      await addCardHistoryBulk(historyEntries);
      
      await db.matchingCards.where('id').anyOf(ids).modify({ status: 'resolved' });
      setSelectedUnmatchedIds([]);
      showToast(`✅ Đã thêm ${ids.length} thẻ vào Hộp ${zone}!`, "success");
    } catch (e) {
      console.error(e);
      showToast("❌ Lỗi thêm vào kho hàng loạt!", "error");
    }
  };

  const bulkIgnore = async (ids: number[]) => {
    if (ids.length === 0) return;
    try {
      await db.matchingCards.where('id').anyOf(ids).delete();
      setSelectedUnmatchedIds([]);
      showToast(`🗑️ Đã bỏ qua ${ids.length} thẻ.`, "info");
    } catch (e) {
      showToast("❌ Lỗi bỏ qua hàng loạt.", "error");
    }
  };

  const clearAllResolved = async () => {
    const resolvedIds = matchingData.filter(r => r.status === 'resolved').map(r => r.id!);
    if (resolvedIds.length) {
       await db.matchingCards.bulkDelete(resolvedIds);
       showToast("Đã dọn dẹp các thẻ đã xử lý.", "success");
    }
  };

  const clearAll = async () => {
    await db.matchingCards.clear();
    showToast("Đã xóa toàn bộ phiên đối sánh.", "warning");
  };


  return {
    toasts,
    showToast,
    matchedRecords,
    unmatchedRecords,
    matchedCardsMap,
    handleScanSuccess,
    handleScannerInput,
    handleImportExcel,
    updateField,
    updateAllFields,
    updateSelectedFields,
    resolveMatch,
    addToWarehouse,
    ignoreRecord,
    selectedMatchedIds,
    setSelectedMatchedIds,
    selectedUnmatchedIds,
    setSelectedUnmatchedIds,
    bulkUpdateAllFields,
    bulkResolveMatch,
    bulkAddToWarehouse,
    bulkIgnore,
    clearAllResolved,
    clearAll,
    isWebCamActive,
    isFlashActive,
    startWebcam,
    stopWebcam
  };
}
