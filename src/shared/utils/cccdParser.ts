// src/utils/cccdParser.ts
import { CCCDRecord } from "@/shared/types/cccd";

// Tạo ID tương thích với cả HTTP và HTTPS
export const generateId = () => {
  // Sử dụng crypto
  // if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
  //   return window.crypto.randomUUID();
  // }
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

export const parseCCCD = (qrText: string): CCCDRecord => {
  const parts = qrText.trim().split("|");
  if (parts.length >= 6) {
    return {
      id: generateId(),
      type: parts.length > 7 ? "Thẻ Căn cước" : "Căn cước công dân",
      idNumber: parts[0] || "",
      oldIdNumber: parts[1] || "",
      fullName: parts[2] || "",
      dob: parts[3] || "",
      gender: parts[4] || "",
      address: parts[5] || "",
      issueDate: parts[6] || "",
      canceledIdNumber: parts[7] || "",
      fatherName: parts[8] || "",
      motherName: parts[9] || "",
      rawText: qrText.trim(),
    };
  }

  return {
    id: generateId(),
    type: "Không hợp lệ",
    idNumber: "", oldIdNumber: "", fullName: "", dob: "", gender: "",
    address: "", issueDate: "", canceledIdNumber: "", fatherName: "", motherName: ""
  };
};