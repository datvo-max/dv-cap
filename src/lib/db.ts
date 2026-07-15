// src/lib/db.ts
import { CCCDRecord } from '@/types/cccd';
import Dexie, { type Table } from 'dexie';
// Thêm dòng này để kích hoạt hàm import/export

// 1. INTERFACE CHO PHÂN HỆ 1 (DANH SÁCH CẤP MỚI)
// Kế thừa toàn bộ CCCDRecord, nhưng idNumber được dùng làm khoá chính (duy nhất)
export interface ScannedRecord extends Omit<CCCDRecord, 'id'> {
  id?: number; // IndexedDB tự động sinh ID số
  scannedAt: string; // Lưu vết thời gian quét
}

// 2. INTERFACE KHO THẺ KẾ THỪA VÀ GHI ĐÈ ID
export interface CardRecord extends Omit<CCCDRecord, 'id'> {
  id?: number;
  importDate: string;
  status: 'pending' | 'returned';
  zone: number;
  returnedAt?: string;
}

class CardDatabase extends Dexie {
  scannedCards!: Table<ScannedRecord>;
  cards!: Table<CardRecord>;

  constructor() {
    super('CCCD_KhoThe_DB');

    this.version(2).stores({
      // Có thể thêm canceledIdNumber vào đây nếu bạn muốn có thể gõ số ĐD cũ lên thanh tìm kiếm
      cards: '++id, &idNumber, fullName, importDate, status, zone, canceledIdNumber',
      scannedCards: '++id, &idNumber, fullName, scannedAt, fatherName, motherName',
    });
  }
}

export const db = new CardDatabase();