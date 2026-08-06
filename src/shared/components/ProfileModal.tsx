import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { userProfile, updateUserProfile, loading } = useAuth();
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [unit, setUnit] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && userProfile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFullName(userProfile.fullName || "");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhone(userProfile.phone || "");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnit(userProfile.unit || "");
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      await updateUserProfile({
        fullName,
        phone,
        unit
      });
      onClose();
    } catch (error) {
      // Lỗi đã được xử lý bằng toast trong AuthContext
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative">
        <div className="bg-slate-800 px-5 py-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Hồ sơ Cá nhân
          </h3>
          <button onClick={onClose} disabled={isProcessing} className="text-slate-400 hover:text-white transition-colors disabled:opacity-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
             <div className="text-center text-slate-500 py-4">Đang tải thông tin...</div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email đăng nhập</label>
                <input
                  type="email"
                  value={userProfile?.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-500 cursor-not-allowed outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Họ và Tên</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Đơn vị công tác</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Ví dụ: Công an phường..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button 
                onClick={handleSave}
                disabled={isProcessing}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 mt-4"
              >
                {isProcessing ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
