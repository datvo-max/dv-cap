// src/lib/db.ts
import { CCCDRecord } from '@/shared/types/cccd';
import Dexie, { type Table } from 'dexie';

// HÀM HỖ TRỢ: Tự động chuyển đổi chuỗi ngày tháng cũ (Việt Nam) sang dạng Số (Timestamp)
function migrateToTimestamp(val: any): number | undefined {
  if (!val) return undefined;
  if (typeof val === 'number') return val; // Nếu đã là số thì giữ nguyên

  try {
    const str = String(val).replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
    const [datePart, timePart] = str.split(' ');
    if (!datePart) return undefined;

    const dateTokens = datePart.split(/[\/\-]/);
    if (dateTokens.length === 3) {
      const day = parseInt(dateTokens[0], 10);
      const month = parseInt(dateTokens[1], 10) - 1; // JS Tháng bắt đầu từ 0
      const year = parseInt(dateTokens[2], 10);

      let hours = 0, minutes = 0, seconds = 0;
      if (timePart) {
        const timeTokens = timePart.split(':');
        hours = parseInt(timeTokens[0] || '0', 10);
        minutes = parseInt(timeTokens[1] || '0', 10);
        seconds = parseInt(timeTokens[2] || '0', 10);
      }
      const d = new Date(year, month, day, hours, minutes, seconds);
      const time = d.getTime();
      return isNaN(time) ? undefined : time;
    }
    return undefined;
  } catch (error) {
    return undefined;
  }
}

export interface ScannedRecord extends Omit<CCCDRecord, 'id'> {
  id?: number;
  scannedAt: string;
}

export interface CardRecord extends Omit<CCCDRecord, 'id'> {
  id?: number;
  importDate: string;
  status: 'pending' | 'returned' | 'shipping'; // CẬP NHẬT: thêm 'shipping'
  zone: number | string;
  returnedAt?: number; // <--- CẬP NHẬT: Đổi thành lưu số (Timestamp)
  isNoPhoto?: boolean;
  phoneNumber?: string;
  shipperName?: string;    // MỚI: Tên shipper
  shipperPhone?: string;   // MỚI: SĐT shipper
  shippedAt?: number;      // MỚI: Thời gian giao cho shipper (Timestamp)
}

export interface UnissuedRecord {
  id?: number;
  idNumber: string;
  fullName: string;
  appointmentDate: string;
  reason: string;
  createdAt: string;
  address?: string;
  phoneNumber?: string;
  result?: string; // MỚI: Kết quả xử lý (Đã đi làm lại, Đã gửi yêu cầu lại...)
}

class CardDatabase extends Dexie {
  scannedCards!: Table<ScannedRecord>;
  cards!: Table<CardRecord>;
  unissuedCards!: Table<UnissuedRecord>;

  constructor() {
    super('CCCD_KhoThe_DB');

    this.version(2).stores({
      cards: '++id, &idNumber, fullName, importDate, status, zone, canceledIdNumber',
      scannedCards: '++id, &idNumber, fullName, scannedAt, fatherName, motherName',
    });

    // Phiên bản 3 bổ sung danh sách có giấy hẹn nhưng không được cấp
    this.version(3).stores({
      cards: '++id, &idNumber, fullName, phoneNumber, importDate, status, zone, canceledIdNumber',
      scannedCards: '++id, &idNumber, fullName, scannedAt, fatherName, motherName',
      unissuedCards: '++id, &idNumber, fullName, appointmentDate'
    });

    // Phiên bản 4: Chạy kịch bản tự động chuyển đổi dữ liệu cũ sang chuẩn Số mới
    this.version(4).stores({
      cards: '++id, &idNumber, fullName, phoneNumber, importDate, status, zone, canceledIdNumber',
      scannedCards: '++id, &idNumber, fullName, scannedAt, fatherName, motherName',
      unissuedCards: '++id, &idNumber, fullName, appointmentDate'
    }).upgrade(tx => {
      return tx.table('cards').toCollection().modify(card => {
        if (card.status === 'returned' && card.returnedAt) {
          card.returnedAt = migrateToTimestamp(card.returnedAt);
        }
      });
    });
  }
}

export const db = new CardDatabase();