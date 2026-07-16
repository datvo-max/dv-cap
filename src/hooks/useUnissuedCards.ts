// src/hooks/useUnissuedCards.ts
import { useState, useCallback } from "react";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export function useUnissuedCards() {
  const [formData, setFormData] = useState({
    idNumber: "", fullName: "", appointmentDate: "",
    reason: "", address: "", phoneNumber: ""
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
        idNumber: formData.idNumber, fullName: formData.fullName,
        appointmentDate: formData.appointmentDate || "-", reason: formData.reason || "Hồ sơ chưa về",
        address: formData.address || "-", phoneNumber: formData.phoneNumber || "-",
        createdAt: new Date().toISOString()
      });

      setFormData({ idNumber: "", fullName: "", appointmentDate: "", reason: "", address: "", phoneNumber: "" });
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
    showToast("🗑️ Đã xóa giấy hẹn khỏi danh sách!", "success");
  };
  const cancelDelete = () => setConfirmingId(null);

  return {
    records, formData, handleInputChange, handleAddRecord,
    requestDelete, confirmDelete, cancelDelete, confirmingId,
    toasts // Trả mảng Toasts ra ngoài
  };
}