// src/hooks/useUnissuedCards.ts
import { useState, useCallback } from "react";
import { db, UnissuedRecord } from "@/shared/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import Tesseract from "tesseract.js";

// HÀM HỖ TRỢ: Phân tích cú pháp văn bản tiếng Việt từ Giấy hẹn
function parseAppointmentText(text: string) {
  const cleanText = text.replace(/\r/g, '').replace(/\n+/g, '\n');
  const lines = cleanText.split('\n').map(line => line.trim()).filter(Boolean);

  let fullName = "";
  let idNumber = "";
  let dob = "";
  let gender = "";
  let address = "";
  let appointmentDate = "";

  // 1. Trích xuất Số định danh (12 chữ số)
  const numbersOnly = text.replace(/[^0-9]/g, '');
  const idMatch = numbersOnly.match(/\d{12}/);
  if (idMatch) {
    idNumber = idMatch[0];
  } else {
    // Dự phòng: dãy số dài từ 9 đến 12 số
    const fallbackMatch = numbersOnly.match(/\d{9,12}/);
    if (fallbackMatch) {
      idNumber = fallbackMatch[0];
    }
  }

  // 2. Quét các dòng văn bản để tìm nhãn tương ứng
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // A. Tìm Họ tên (ví dụ: đối với Ông/bà: BIỆN MINH NGUYỄN)
    if (/(?:Ông\s*[\/\-]\s*bà|đối\s+với\s+Ông\s*[\/\-]\s*bà|đối\s+với|Ông\s+bà)/i.test(line)) {
      const match = line.match(/(?:Ông\s*[\/\-]\s*bà|Ông\s*bà|đối\s+với)\s*[:\.\s\-]*\s*([A-ZÀ-ỸđĐa-zà-ỹ\s]{3,})/i);
      if (match && match[1]) {
        const extracted = match[1].trim();
        // Loại bỏ các chữ hoa bị dính vào do OCR quét dòng ngang
        const cleanName = extracted.replace(/(?:Số\s+định|Ngày\s+tháng|Giới\s+tính).*/i, '').trim();
        if (cleanName && cleanName.length > 3 && cleanName.toUpperCase() !== "TRẢ THỂ CĂN CƯỚC") {
          fullName = cleanName;
        }
      }
    }

    // B. Ngày tháng năm sinh
    if (/sinh/i.test(line) || /Ngày\s*,\s*tháng\s*,\s*năm\s*sinh/i.test(line)) {
      const dateMatch = line.match(/(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/);
      if (dateMatch) {
        dob = dateMatch[1].replace(/\./g, '/');
      }
    }

    // C. Giới tính
    if (/Giới\s*tính/i.test(line)) {
      const genderMatch = line.match(/Giới\s*tính\s*[:\.\s\-]*\s*(Nam|Nữ|Nir)/i);
      if (genderMatch && genderMatch[1]) {
        gender = genderMatch[1].trim();
        if (gender.toLowerCase() === 'nir') gender = 'Nữ'; // Dự phòng lỗi OCR chữ Nữ
      }
    }

    // D. Nơi cư trú
    if (/cư\s*trú/i.test(line) || /Nơi\s*cư/i.test(line)) {
      const addrMatch = line.match(/(?:Nơi\s*cư\s*trú|cư\s*trú)\s*[:\.\s\-]*\s*(.*)/i);
      if (addrMatch && addrMatch[1]) {
        address = addrMatch[1].trim();
      }
      // Nối tiếp địa chỉ ở dòng tiếp theo nếu dòng hiện tại ngắn
      if (address.length < 15 && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (!nextLine.includes(':') && !/Thời\s*gian/i.test(nextLine) && !/Tại\s*địa\s*chỉ/i.test(nextLine)) {
          address = (address + " " + nextLine).trim();
        }
      }
    }

    // E. Ngày hẹn trả thẻ
    if (/ngày\s*:\s*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i.test(line)) {
      const match = line.match(/ngày\s*:\s*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);
      if (match && match[1]) {
        appointmentDate = match[1].replace(/\./g, '/');
      }
    } else if (/hẹn\s*trả.*ngày/i.test(line) || /ngày\s*hẹn/i.test(line)) {
      const dateMatch = line.match(/(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/);
      if (dateMatch) {
        appointmentDate = dateMatch[1].replace(/\./g, '/');
      } else if (i + 1 < lines.length) {
        const nextDateMatch = lines[i + 1].match(/(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/);
        if (nextDateMatch) {
          appointmentDate = nextDateMatch[1].replace(/\./g, '/');
        }
      }
    }
  }

  // Viết hoa chuẩn tên họ
  if (fullName) {
    fullName = fullName
      .replace(/[^a-zA-ZÀ-ỹ\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();
  }

  return {
    fullName: fullName || "Chưa rõ",
    idNumber: idNumber || "",
    dob: dob || "-",
    gender: gender || "-",
    address: address || "-",
    appointmentDate: appointmentDate || "-"
  };
}

export function useUnissuedCards() {
  const [formData, setFormData] = useState({
    idNumber: "",
    fullName: "",
    dob: "",
    gender: "",
    appointmentDate: "",
    reason: "",
    address: "",
    phoneNumber: ""
  });

  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  // MỚI: Khởi tạo mảng quản lý Toast riêng cho Phân hệ 3
  interface ToastItem { id: number; msg: string; type: "success" | "error" | "warning" | "info"; }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((msg: string, type: "success" | "error" | "warning" | "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const records = useLiveQuery(() => db.unissuedCards.orderBy('id').reverse().toArray());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.idNumber || !formData.fullName) {
      showToast("⚠️ Vui lòng nhập ít nhất Số CCCD và Họ Tên!", "warning");
      return;
    }

    try {
      const isExist = await db.unissuedCards.where('idNumber').equals(formData.idNumber).count();
      if (isExist > 0) {
        showToast(`⚠️ Số CCCD ${formData.idNumber} đã tồn tại trong danh sách giấy hẹn!`, "error");
        return;
      }

      await db.unissuedCards.add({
        idNumber: formData.idNumber,
        fullName: formData.fullName,
        dob: formData.dob || "-",
        gender: formData.gender || "-",
        appointmentDate: formData.appointmentDate || "-",
        reason: formData.reason || "Hồ sơ chưa về",
        address: formData.address || "-",
        phoneNumber: formData.phoneNumber || "-",
        createdAt: new Date().toISOString(),
        result: "Chờ xử lý"
      });

      setFormData({
        idNumber: "",
        fullName: "",
        dob: "",
        gender: "",
        appointmentDate: "",
        reason: "",
        address: "",
        phoneNumber: ""
      });
      showToast("✅ Đã thêm giấy hẹn vào danh sách!", "success");
    } catch (error) {
      console.error("Lỗi khi thêm danh sách hẹn:", error);
      showToast("❌ Có lỗi xảy ra khi lưu dữ liệu.", "error");
    }
  };

  const requestDelete = (id: number) => setConfirmingId(id);
  const confirmDelete = async (id: number) => {
    await db.unissuedCards.delete(id);
    setConfirmingId(null);
    showToast("🗑️ Đã xóa trường hợp này khỏi danh sách!", "success");
  };
  const cancelDelete = () => setConfirmingId(null);

  const handleUpdateResult = async (id: number, result: string) => {
    try {
      await db.unissuedCards.update(id, { result });
      showToast("✅ Đã cập nhật kết quả xử lý!", "success");
    } catch (error) {
      console.error("Lỗi khi cập nhật kết quả:", error);
      showToast("❌ Có lỗi xảy ra khi cập nhật kết quả!", "error");
    }
  };

  const [isScanningPhoto, setIsScanningPhoto] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsScanningPhoto(true);

    // XỬ LÝ TRƯỜNG HỢP: Upload 1 ảnh duy nhất (Pre-fill vào biểu mẫu để người dùng duyệt lại)
    if (files.length === 1) {
      showToast("📸 Đang phân tích chữ từ giấy hẹn (OCR)...", "warning");
      try {
        const file = files[0];
        const result = await Tesseract.recognize(file, 'vie');
        const text = result.data.text;
        const parsed = parseAppointmentText(text);

        if (parsed.idNumber) {
          setFormData({
            idNumber: parsed.idNumber,
            fullName: parsed.fullName,
            dob: parsed.dob,
            gender: parsed.gender,
            address: parsed.address,
            phoneNumber: "",
            appointmentDate: parsed.appointmentDate,
            reason: "Hồ sơ chưa về"
          });
          showToast("📋 Đã trích xuất thông tin giấy hẹn vào biểu mẫu! Hãy kiểm tra và lưu lại.", "success");
        } else {
          showToast("⚠️ Nhận dạng thành công nhưng không tìm thấy Số định danh cá nhân hợp lệ!", "warning");
        }
      } catch (err) {
        console.error("Lỗi xử lý OCR:", err);
        showToast("❌ Lỗi trong quá trình quét ảnh giấy hẹn!", "error");
      } finally {
        setIsScanningPhoto(false);
        e.target.value = "";
      }
      return;
    }

    // XỬ LÝ TRƯỜNG HỢP: Upload nhiều ảnh (Tự động nạp trực tiếp hàng loạt vào Database)
    showToast("📸 Đang chạy OCR phân tích hàng loạt ảnh...", "warning");
    let failCount = 0;
    const newRecords: UnissuedRecord[] = [];
    const duplicateNames: string[] = [];

    // Lấy danh sách ID đã có trong DB
    const existingIds = new Set((await db.unissuedCards.toArray()).map(c => c.idNumber));

    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        const result = await Tesseract.recognize(file, 'vie');
        const text = result.data.text;
        const parsed = parseAppointmentText(text);

        if (parsed.idNumber) {
          const isAlreadyExists = existingIds.has(parsed.idNumber) || newRecords.some(r => r.idNumber === parsed.idNumber);

          if (isAlreadyExists) {
            duplicateNames.push(parsed.fullName);
          } else {
            newRecords.push({
              idNumber: parsed.idNumber,
              fullName: parsed.fullName,
              dob: parsed.dob,
              gender: parsed.gender,
              address: parsed.address,
              phoneNumber: "-",
              appointmentDate: parsed.appointmentDate,
              reason: "Hồ sơ chưa về",
              createdAt: new Date().toISOString(),
              result: "Chờ xử lý"
            });
          }
        } else {
          failCount++;
        }
      } catch (err) {
        console.error("Lỗi quét hàng loạt ảnh:", err);
        failCount++;
      }
    }

    if (newRecords.length > 0) {
      await db.unissuedCards.bulkAdd(newRecords);
      const namesList = newRecords.map(r => r.fullName);
      const successMessage = namesList.length <= 3
        ? `✅ Đã nạp thành công: ${namesList.join(", ")}`
        : `✅ Đã nạp thành công: ${namesList.slice(0, 3).join(", ")} và ${namesList.length - 3} người khác.`;
      showToast(successMessage, "success");
    }

    if (duplicateNames.length > 0) {
      setTimeout(() => {
        if (duplicateNames.length <= 2) {
          duplicateNames.forEach(name => showToast(`⚠️ Giấy hẹn của ${name} đã tồn tại trong danh sách`, "warning"));
        } else {
          showToast(`⚠️ Có ${duplicateNames.length} trường hợp bị trùng lặp.`, "warning");
        }
      }, newRecords.length > 0 ? 1500 : 0);
    }

    if (failCount > 0) {
      setTimeout(() => {
        showToast(`❌ Có ${failCount} ảnh bị mờ hoặc không nhận diện được chữ.`, "error");
      }, (newRecords.length > 0 || duplicateNames.length > 0) ? 3000 : 0);
    }

    setIsScanningPhoto(false);
    e.target.value = "";
  };

  return {
    records, formData, handleInputChange, handleAddRecord,
    requestDelete, confirmDelete, cancelDelete, confirmingId,
    toasts,
    handleUpdateResult,
    handleImageUpload,
    isScanningPhoto
  };
}