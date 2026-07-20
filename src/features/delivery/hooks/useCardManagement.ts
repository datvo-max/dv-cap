// src/hooks/useCardManagement.ts
import { useState } from "react";
import { db, CardRecord, addCardHistory, addCardHistoryBulk } from "@/shared/lib/db";

// Nhận hàm showToast từ bên ngoài truyền vào
export function useCardManagement(showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void) {

  // 1. NGHIỆP VỤ SỬA / XÓA THẺ
  const [editModalConfig, setEditModalConfig] = useState<{ isOpen: boolean, cardId: number | null }>({ isOpen: false, cardId: null });
  const openEditModal = (id: number) => setEditModalConfig({ isOpen: true, cardId: id });
  const closeEditModal = () => setEditModalConfig({ isOpen: false, cardId: null });

  const updateCardDetails = async (id: number, updates: Partial<CardRecord>) => {
    try {
      const existing = await db.cards.get(id);
      if (!existing) {
        showToast("❌ Không tìm thấy hồ sơ thẻ này!", "error");
        return;
      }
      await db.cards.update(id, updates);

      const changes: string[] = [];
      if (updates.fullName !== undefined) {
        const oldVal = existing.fullName || "";
        const newVal = updates.fullName || "";
        if (oldVal !== newVal) {
          changes.push(`Họ tên: "${oldVal}" -> "${newVal}"`);
        }
      }
      if (updates.idNumber !== undefined) {
        const oldVal = existing.idNumber || "";
        const newVal = updates.idNumber || "";
        if (oldVal !== newVal) {
          changes.push(`Số CCCD: "${oldVal}" -> "${newVal}"`);
        }
      }
      if (updates.phoneNumber !== undefined) {
        const oldVal = existing.phoneNumber || "";
        const newVal = updates.phoneNumber || "";
        if (oldVal !== newVal) {
          changes.push(`SĐT liên hệ: "${oldVal || 'Trống'}" -> "${newVal || 'Trống'}"`);
        }
      }
      if (updates.zone !== undefined) {
        const oldVal = String(existing.zone || "");
        const newVal = String(updates.zone || "");
        if (oldVal !== newVal) {
          changes.push(`Vị trí Hộp: "${oldVal}" -> "${newVal}"`);
        }
      }
      if (updates.isNoPhoto !== undefined && updates.isNoPhoto !== existing.isNoPhoto) {
        changes.push(`Đánh dấu không ảnh: ${existing.isNoPhoto ? 'Có' : 'Không'} -> ${updates.isNoPhoto ? 'Có' : 'Không'}`);
      }
      if (updates.shipperName !== undefined) {
        const oldVal = existing.shipperName || "";
        const newVal = updates.shipperName || "";
        if (oldVal !== newVal) {
          changes.push(`Tên Shipper: "${oldVal || 'Trống'}" -> "${newVal || 'Trống'}"`);
        }
      }
      if (updates.shipperPhone !== undefined) {
        const oldVal = existing.shipperPhone || "";
        const newVal = updates.shipperPhone || "";
        if (oldVal !== newVal) {
          changes.push(`SĐT Shipper: "${oldVal || 'Trống'}" -> "${newVal || 'Trống'}"`);
        }
      }

      if (changes.length > 0) {
        await addCardHistory(updates.idNumber || existing.idNumber, 'edit', `Cập nhật: ${changes.join(', ')}`);
      }

      showToast("✅ Đã cập nhật thông tin thẻ!", "success");
      closeEditModal();
    } catch {
      showToast("❌ Có lỗi xảy ra khi lưu!", "error");
    }
  };


  const deleteCard = async (id: number) => {
    try {
      const existing = await db.cards.get(id);
      if (existing) {
        await db.cardHistory.where('idNumber').equals(existing.idNumber).delete();
      }
      await db.cards.delete(id);
      showToast("🗑️ Đã xóa thẻ khỏi hệ thống!", "success");
      closeEditModal();
    } catch {
      showToast("❌ Có lỗi xảy ra khi xóa thẻ!", "error");
    }
  };

  // 2. NGHIỆP VỤ GỘP HỘP
  const [mergeModalConfig, setMergeModalConfig] = useState({ isOpen: false });
  const openMergeModal = () => setMergeModalConfig({ isOpen: true });
  const closeMergeModal = () => setMergeModalConfig({ isOpen: false });

  const executeMergeBoxes = async (boxA: string, boxB: string, newBoxName: string) => {
    try {
      // 1. CHUẨN BỊ LƯỚI QUÉT (Bao trùm cả kiểu String và Number)
      const searchKeys: (string | number)[] = [];
      [boxA, boxB].forEach(box => {
        searchKeys.push(String(box)); // Nạp kiểu chuỗi (VD: "1" hoặc "K1")
        if (!isNaN(Number(box))) {
          searchKeys.push(Number(box)); // Nếu là số, nạp thêm kiểu số (VD: 1)
        }
      });

      // 2. ÉP KIỂU TÊN HỘP MỚI (Nếu nhập "3" thì lưu thành số 3, nhập "K3" thì giữ nguyên chuỗi)
      const finalNewBoxName = isNaN(Number(newBoxName)) ? newBoxName : Number(newBoxName);

      // Lấy danh sách thẻ bị ảnh hưởng trước khi gộp để ghi lịch sử
      const affectedCards = await db.cards.where('zone').anyOf(searchKeys).toArray();

      // 3. THỰC THI GỘP HỘP
      const updatedCount = await db.cards
        .where('zone')
        .anyOf(searchKeys)
        .modify({ zone: finalNewBoxName });

      if (updatedCount === 0) {
        showToast("⚠️ Không tìm thấy thẻ nào trong 2 hộp này để gộp!", "warning");
      } else {
        if (affectedCards.length > 0) {
          const historyEntries = affectedCards.map(c => ({
            idNumber: c.idNumber,
            action: 'merge_box' as const,
            details: `Gộp từ Hộp ${c.zone} sang Hộp ${finalNewBoxName}`
          }));
          await addCardHistoryBulk(historyEntries);
        }
        showToast(`✅ Đã gộp thành công ${updatedCount} thẻ vào hộp ${finalNewBoxName}!`, "success");
        closeMergeModal();
      }
    } catch (error) {
      console.error("Lỗi khi gộp hộp:", error);
      showToast("❌ Có lỗi xảy ra trong quá trình gộp hộp!", "error");
    }
  };


  return {
    editModalConfig, openEditModal, closeEditModal, updateCardDetails, deleteCard,
    mergeModalConfig, openMergeModal, closeMergeModal, executeMergeBoxes
  };
}