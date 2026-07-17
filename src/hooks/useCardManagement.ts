// src/hooks/useCardManagement.ts
import { useState } from "react";
import { db, CardRecord } from "@/lib/db";

// Nhận hàm showToast từ bên ngoài truyền vào
export function useCardManagement(showToast: (msg: string, type: any) => void) {

  // 1. NGHIỆP VỤ SỬA / XÓA THẺ
  const [editModalConfig, setEditModalConfig] = useState<{ isOpen: boolean, cardId: number | null }>({ isOpen: false, cardId: null });
  const openEditModal = (id: number) => setEditModalConfig({ isOpen: true, cardId: id });
  const closeEditModal = () => setEditModalConfig({ isOpen: false, cardId: null });

  const updateCardDetails = async (id: number, updates: Partial<CardRecord>) => {
    try {
      await db.cards.update(id, updates);
      showToast("✅ Đã cập nhật thông tin thẻ!", "success");
      closeEditModal();
    } catch (error) {
      showToast("❌ Có lỗi xảy ra khi lưu!", "error");
    }
  };


  const deleteCard = async (id: number) => {
    try {
      await db.cards.delete(id);
      showToast("🗑️ Đã xóa thẻ khỏi hệ thống!", "success");
      closeEditModal();
    } catch (error) {
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

      // 3. THỰC THI GỘP HỘP
      const updatedCount = await db.cards
        .where('zone')
        .anyOf(searchKeys)
        .modify({ zone: finalNewBoxName });

      if (updatedCount === 0) {
        showToast("⚠️ Không tìm thấy thẻ nào trong 2 hộp này để gộp!", "warning");
      } else {
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