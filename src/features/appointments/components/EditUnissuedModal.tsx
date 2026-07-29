import React, { useState, useEffect } from "react";
import { UnissuedRecord } from "@/shared/lib/db";

interface EditUnissuedModalProps {
  isOpen: boolean;
  record: UnissuedRecord | null;
  onClose: () => void;
  onSave: (id: number, updates: Partial<UnissuedRecord>) => void;
  suggestedReasons: string[];
}

export default function EditUnissuedModal({ isOpen, record, onClose, onSave, suggestedReasons }: EditUnissuedModalProps) {
  const [formData, setFormData] = useState<Partial<UnissuedRecord>>({});

  useEffect(() => {
    if (isOpen && record) {
      setFormData(record);
    }
  }, [isOpen, record]);

  if (!isOpen || !record) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (record.id !== undefined) {
      onSave(record.id, formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-orange-600 px-5 py-3 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm">Chỉnh sửa giấy hẹn</h3>
          <button onClick={onClose} className="text-orange-200 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Số CCCD (*)</label>
              <input type="text" name="idNumber" value={formData.idNumber || ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-orange-500 outline-none" required />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Họ và Tên (*)</label>
              <input type="text" name="fullName" value={formData.fullName || ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-orange-500 outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ngày Sinh</label>
              <input type="text" name="dob" value={formData.dob || ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Giới Tính</label>
              <input type="text" name="gender" value={formData.gender || ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Số Điện Thoại</label>
              <input type="text" name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ngày Hẹn</label>
              <input type="text" name="appointmentDate" value={formData.appointmentDate || ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-orange-500 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Địa Chỉ</label>
              <input type="text" name="address" value={formData.address || ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-orange-500 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Lý do chưa cấp</label>
              <input
                type="text"
                name="reason"
                list="edit-reasons-list"
                value={formData.reason || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-orange-500 outline-none"
              />
              <datalist id="edit-reasons-list">
                {suggestedReasons.map(r => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
              Hủy
            </button>
            <button type="submit" className="px-4 py-2 rounded-md text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-sm cursor-pointer">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
