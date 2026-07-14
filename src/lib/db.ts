// src/lib/db.ts
import { CCCDRecord } from '@/types/cccd';
import Dexie, { type Table } from 'dexie';



// 2. INTERFACE KHO THẺ KẾ THỪA VÀ GHI ĐÈ ID
export interface CardRecord extends Omit<CCCDRecord, 'id'> {
  id?: number;
  importDate: string;
  status: 'pending' | 'returned';
  zone: number;
  returnedAt?: string;
}

class CardDatabase extends Dexie {
  cards!: Table<CardRecord>;

  constructor() {
    super('CCCD_KhoThe_DB');

    this.version(1).stores({
      // Có thể thêm canceledIdNumber vào đây nếu bạn muốn có thể gõ số ĐD cũ lên thanh tìm kiếm
      cards: '++id, &idNumber, fullName, importDate, status, zone, canceledIdNumber'
    });
  }
}

export const db = new CardDatabase();