// src/types/cccd.ts

export interface CCCDRecord {
  id: string; // Tạo ID ngẫu nhiên để làm key cho React
  type: "Căn cước công dân" | "Thẻ Căn cước" | "Không hợp lệ";
  idNumber: string;
  oldIdNumber: string;
  fullName: string;
  dob: string;
  gender: string;
  address: string;
  issueDate: string;
  spouseName: string;
  fatherName: string;
  motherName: string;
  rawText?: string;
}