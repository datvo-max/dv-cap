// src/components/AssignShipperModal.tsx
import React, { useState, useEffect } from "react";

interface AssignShipperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, phone: string) => void;
}

export default function AssignShipperModal({ isOpen, onClose, onConfirm }: AssignShipperModalProps) {
  const [shipperName, setShipperName] = useState("");
  const [shipperPhone, setShipperPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setShipperName("");
      setShipperPhone("");
      setError("");
    }
  }, [isOpen]);

  const toTitleCase = (str: string) => {
    return str
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const validateVNPhone = (phone: string) => {
    const regex = /^(0|84|\+84)(3|5|7|8|9)\d{8}$/;
    return regex.test(phone.replace(/\s+/g, ""));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrimmed = toTitleCase(shipperName.trim());
    const phoneTrimmed = shipperPhone.trim();
    if (!nameTrimmed) {
      setError("Vui lòng nhập tên shipper!");
      return;
    }
    if (!phoneTrimmed) {
      setError("Vui lòng nhập số điện thoại shipper!");
      return;
    }
    if (!validateVNPhone(phoneTrimmed)) {
      setError("Số điện thoại shipper không hợp lệ! Vui lòng nhập đúng số điện thoại VN (10 số).");
      return;
    }
    onConfirm(nameTrimmed, phoneTrimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="bg-amber-600 px-5 py-3 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Bàn giao thẻ cho Shipper
          </h3>
          <button onClick={onClose} className="text-amber-200 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <p className="text-xs text-gray-500 font-medium">
              Vui lòng điền thông tin shipper để thực hiện bàn giao hàng loạt thẻ đã chọn. Trạng thái của các thẻ sẽ được cập nhật sang "Đang giao".
            </p>

            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg animate-pulse">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Tên Shipper <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={shipperName}
                onChange={(e) => { setShipperName(e.target.value); setError(""); }}
                onBlur={() => setShipperName(toTitleCase(shipperName))}
                placeholder="Nhập họ tên shipper (VD: Nguyễn Văn A)..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={shipperPhone}
                onChange={(e) => { setShipperPhone(e.target.value); setError(""); }}
                placeholder="Nhập số điện thoại shipper..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="bg-gray-50 px-5 py-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-sm"
            >
              Xác nhận bàn giao
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
