// src/components/EditCardModal.tsx
import React, { useState, useEffect, useRef } from "react";
import { db, CardRecord, addCardHistory, HistoryRecord } from "@/shared/lib/db";
import { parseCCCD } from "@/shared/utils/cccdParser";

interface EditCardModalProps {
  isOpen: boolean;
  cardId: number | null;
  onClose: () => void;
  onSave: (id: number, updates: Partial<CardRecord>) => void;
  onDelete: (id: number) => void;
  onShowToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onUndoReturn: (id: number) => void; // MỚI: Truyền hàm hoàn tác vào Modal
}

export default function EditCardModal({ isOpen, cardId, onClose, onSave, onDelete, onShowToast, onUndoReturn }: EditCardModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isNoPhoto, setIsNoPhoto] = useState(false);
  const [shipperName, setShipperName] = useState("");
  const [shipperPhone, setShipperPhone] = useState("");
  const [cardData, setCardData] = useState<Partial<CardRecord>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [scanValue, setScanValue] = useState("");
  const scannerInputRef = useRef<HTMLInputElement>(null);

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isConfirmingUndo, setIsConfirmingUndo] = useState(false); // MỚI: State cho pop-up hoàn tác

  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');
  const [historyLogs, setHistoryLogs] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    async function loadCardData() {
      if (isOpen && cardId) {
        setIsLoading(true);
        setIsScanning(false);
        setScanValue("");
        setIsConfirmingDelete(false);
        setIsConfirmingUndo(false); // Đóng pop-up cũ khi mở thẻ mới
        setActiveTab('info'); // Reset tab khi mở thẻ mới
        const card = await db.cards.get(cardId);
        if (card) {
          setPhoneNumber(card.phoneNumber || "");
          setIsNoPhoto(!!card.isNoPhoto);
          setShipperName(card.shipperName || "");
          setShipperPhone(card.shipperPhone || "");
          setCardData(card);

          // Tải lịch sử tác động của thẻ
          const logs = await db.cardHistory.where('idNumber').equals(card.idNumber).toArray();
          logs.sort((a, b) => b.timestamp - a.timestamp);
          setHistoryLogs(logs);
        }
        setIsLoading(false);
      }
    }
    loadCardData();
  }, [isOpen, cardId]);

  const handleStartScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      scannerInputRef.current?.focus();
    }, 100);
  };

  const handleScanInput = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && scanValue) {
      const parsed = parseCCCD(scanValue);
      if (parsed.idNumber) {
        const existingCard = await db.cards.where('idNumber').equals(parsed.idNumber).first();
        if (existingCard && existingCard.id !== cardId) {
          onShowToast(`⚠️ Lỗi: Số CCCD ${parsed.idNumber} đang thuộc về thẻ của ${existingCard.fullName} trong kho!`, "error");
          setScanValue("");
          return;
        }

        setCardData(prev => ({
          ...prev,
          idNumber: parsed.idNumber,
          fullName: parsed.fullName,
          dob: parsed.dob,
          address: parsed.address,
          gender: parsed.gender,
          issueDate: parsed.issueDate,
          oldIdNumber: parsed.oldIdNumber,
          fatherName: parsed.fatherName,
          motherName: parsed.motherName,
        }));
        setIsScanning(false);
        setScanValue("");
        onShowToast("✅ Đã cập nhật mã QR mới thành công!", "success");
      } else {
        onShowToast("❌ Mã QR không hợp lệ, vui lòng quét lại!", "error");
        setScanValue("");
      }
    }
  };

  if (!isOpen || !cardId) return null;

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

  const handleSave = () => {
    // 1. Validate Số điện thoại công dân nếu có nhập
    if (phoneNumber.trim() && !validateVNPhone(phoneNumber)) {
      onShowToast("❌ Số điện thoại công dân không hợp lệ! Vui lòng nhập đúng định dạng VN (10 số).", "error");
      return;
    }

    const nameTrimmed = toTitleCase(shipperName.trim());
    const phoneTrimmed = shipperPhone.trim();

    // 2. Validate Shipper nếu thẻ ở trạng thái shipping
    if (cardData.status === 'shipping') {
      if (!nameTrimmed) {
        onShowToast("❌ Vui lòng nhập tên Shipper!", "error");
        return;
      }
      if (!phoneTrimmed) {
        onShowToast("❌ Vui lòng nhập số điện thoại Shipper!", "error");
        return;
      }
      if (!validateVNPhone(phoneTrimmed)) {
        onShowToast("❌ Số điện thoại Shipper không hợp lệ! Vui lòng nhập đúng số điện thoại VN (10 số).", "error");
        return;
      }
    }

    onSave(cardId, { 
      ...cardData, 
      phoneNumber: phoneNumber.trim(), 
      isNoPhoto, 
      shipperName: nameTrimmed || undefined, 
      shipperPhone: phoneTrimmed || undefined 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">

        <div className="bg-indigo-600 px-5 py-3 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm">Chỉnh sửa thông tin thẻ</h3>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* THANH TAB ĐIỀU HƯỚNG */}
        {!isLoading && (
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3 text-xs font-bold transition-all duration-150 border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'info'
                  ? "border-indigo-600 text-indigo-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              📋 Chi tiết thẻ
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 text-xs font-bold transition-all duration-150 border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? "border-indigo-600 text-indigo-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              🕒 Lịch sử tác động ({historyLogs.length})
            </button>
          </div>
        )}

        <div className="p-5 space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 text-sm">Đang tải dữ liệu...</div>
          ) : activeTab === 'history' ? (
            <div className="max-h-[380px] overflow-y-auto space-y-4 pr-1">
              {historyLogs.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs">
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Chưa ghi nhận lịch sử tác động nào cho thẻ này.
                </div>
              ) : (
                <div className="relative pl-6 border-l border-gray-200 space-y-5 py-2 ml-4">
                  {historyLogs.map((log) => {
                    let iconBg = 'bg-blue-50 text-blue-600 border border-blue-200';
                    let actionLabel = 'Nạp thẻ';
                    let iconSvg = (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    );

                    if (log.action === 'return' || log.action === 'bulk_confirm_delivered') {
                      iconBg = 'bg-green-50 text-green-600 border border-green-200';
                      actionLabel = log.action === 'return' ? 'Đã trả thẻ' : 'Giao hàng thành công';
                      iconSvg = (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                      );
                    } else if (log.action === 'assign_shipper') {
                      iconBg = 'bg-indigo-50 text-indigo-600 border border-indigo-200';
                      actionLabel = 'Bàn giao shipper';
                      iconSvg = (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      );
                    } else if (log.action === 'undo_return' || log.action === 'bulk_return_to_warehouse') {
                      iconBg = 'bg-orange-50 text-orange-600 border border-orange-200';
                      actionLabel = 'Khôi phục về kho';
                      iconSvg = (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                      );
                    } else if (log.action === 'edit') {
                      iconBg = 'bg-amber-50 text-amber-600 border border-amber-200';
                      actionLabel = 'Sửa thông tin';
                      iconSvg = (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      );
                    } else if (log.action === 'merge_box') {
                      iconBg = 'bg-purple-50 text-purple-600 border border-purple-200';
                      actionLabel = 'Gộp hộp';
                      iconSvg = (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                      );
                    }

                    return (
                      <div key={log.id} className="relative">
                        <span className={`absolute -left-[35px] top-0.5 flex items-center justify-center w-5 h-5 rounded-full ring-4 ring-white ${iconBg}`}>
                          {iconSvg}
                        </span>
                        <div className="flex flex-col bg-gray-50/50 hover:bg-gray-55 p-2.5 rounded-lg border border-gray-150 transition-colors shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-800 uppercase tracking-wide">{actionLabel}</span>
                            <span className="text-[9px] text-gray-400 font-medium">{new Date(log.timestamp).toLocaleString('vi-VN')}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 font-medium leading-relaxed">{log.details}</p>
                          <div className="flex items-center gap-1 mt-1.5 border-t border-gray-200/50 pt-1 text-[9px] text-gray-500 font-bold">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            Người thực hiện: <span className="text-gray-700 font-extrabold">{log.actor}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-xs font-bold text-gray-700">Công dân</label>
                  {!isScanning && (
                    <button onClick={handleStartScan} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 font-bold flex items-center gap-1 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                      Quét lại QR
                    </button>
                  )}
                </div>

                {isScanning ? (
                  <input
                    ref={scannerInputRef}
                    type="text"
                    value={scanValue}
                    onChange={(e) => setScanValue(e.target.value)}
                    onKeyDown={handleScanInput}
                    onBlur={() => { if (!scanValue) setIsScanning(false); }}
                    placeholder="🔫 Đang chờ máy quét..."
                    className="w-full px-3 py-3 border-2 border-dashed border-blue-400 rounded-md bg-blue-50 text-blue-800 text-sm focus:ring-0 outline-none placeholder-blue-400 font-medium"
                  />
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm transition-all">
                    <p className="font-bold text-gray-800">{cardData.fullName}</p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{cardData.idNumber}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Số điện thoại liên hệ</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Nhập số điện thoại..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  autoFocus={!isScanning}
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={isNoPhoto}
                    onChange={(e) => setIsNoPhoto(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Đánh dấu: Thẻ không thu nhận sinh trắc (Không ảnh)</span>
                </label>
              </div>

              {cardData.status === 'shipping' && (
                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between border-b border-amber-100/60 pb-2">
                    <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Thông tin Shipper bàn giao
                    </h4>
                    {cardData.shippedAt && (
                      <span className="text-[9px] text-amber-700 font-bold bg-amber-100/50 px-2 py-0.5 rounded-md">
                        Đã chuyển: {new Date(cardData.shippedAt).toLocaleString('vi-VN')}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-amber-900/80 mb-1 uppercase tracking-wide">Tên Shipper</label>
                      <input
                        type="text"
                        value={shipperName}
                        onChange={(e) => setShipperName(e.target.value)}
                        onBlur={() => setShipperName(toTitleCase(shipperName))}
                        placeholder="Tên shipper..."
                        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-md text-xs focus:ring-2 focus:ring-amber-500 outline-none text-gray-800 font-semibold shadow-sm focus:border-amber-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-amber-900/80 mb-1 uppercase tracking-wide">Số điện thoại</label>
                      <input
                        type="text"
                        value={shipperPhone}
                        onChange={(e) => setShipperPhone(e.target.value)}
                        placeholder="SĐT shipper..."
                        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-md text-xs focus:ring-2 focus:ring-amber-500 outline-none text-gray-800 font-semibold shadow-sm focus:border-amber-400 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-gray-50 px-5 py-3 border-t flex justify-between items-center gap-2">
          {activeTab === 'history' ? (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
              >
                Đóng
              </button>
            </div>
          ) : (
            <>
              {/* BÊN TRÁI: Chỉ có nút Xóa nguy hiểm */}
              <div>
                <div className="relative">
                  {isConfirmingDelete && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white border border-red-200 shadow-xl rounded-lg p-2 flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200 whitespace-nowrap">
                      <span className="text-xs text-red-600 font-bold px-1">Xóa thẻ này khỏi kho?</span>
                      <button
                        onClick={() => onDelete(cardId)}
                        className="px-2 py-1.5 bg-red-500 text-white text-[11px] font-bold rounded-md shadow-sm hover:bg-red-600 cursor-pointer"
                      >Xác nhận</button>
                      <button
                        onClick={() => setIsConfirmingDelete(false)}
                        className="px-2 py-1.5 bg-gray-100 text-gray-600 text-[11px] font-bold rounded-md hover:bg-gray-200 cursor-pointer"
                      >Hủy</button>
                      <div className="absolute -bottom-1 left-4 w-2 h-2 bg-white border-b border-r border-red-200 transform rotate-45"></div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="px-3 py-2 rounded-md text-xs font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Xóa thẻ
                  </button>
                </div>
              </div>

              {/* BÊN PHẢI: Các nút hành động nghiệp vụ & Lưu thông tin */}
              <div className="flex items-center gap-2">
                {/* Nút Trả lại kho (Hoàn tác) */}
                {(cardData.status === 'returned' || cardData.status === 'shipping') && (
                  <div className="relative">
                    {isConfirmingUndo && (
                      <div className="absolute bottom-full right-0 mb-2 bg-white border border-orange-200 shadow-xl rounded-lg p-2 flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200 whitespace-nowrap">
                        <span className="text-xs text-orange-600 font-bold px-1">
                          {cardData.status === 'shipping' ? "Hủy giao & trả thẻ về kho?" : "Trả thẻ này lại vào kho?"}
                        </span>
                        <button
                          onClick={() => { onUndoReturn(cardId); onClose(); }}
                          className="px-2 py-1.5 bg-orange-500 text-white text-[11px] font-bold rounded-md shadow-sm hover:bg-orange-600 cursor-pointer"
                        >Đồng ý</button>
                        <button
                          onClick={() => setIsConfirmingUndo(false)}
                          className="px-2 py-1.5 bg-gray-100 text-gray-600 text-[11px] font-bold rounded-md hover:bg-gray-200 cursor-pointer"
                        >Hủy</button>
                        <div className="absolute -bottom-1 right-4 w-2 h-2 bg-white border-b border-r border-orange-200 transform rotate-45"></div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsConfirmingUndo(true)}
                      className="px-3 py-2 rounded-md text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                      Trả lại kho
                    </button>
                  </div>
                )}

                {/* Nút Đã giao xong */}
                {cardData.status === 'shipping' && (
                  <button
                    type="button"
                    onClick={async () => {
                      await db.cards.update(cardId, { status: 'returned', returnedAt: Date.now() });
                      if (cardData.idNumber) {
                        await addCardHistory(cardData.idNumber, 'return', `Xác nhận giao xong cho shipper ${cardData.shipperName || ''}`);
                      }
                      onShowToast("✅ Đã xác nhận shipper giao thẻ thành công!", "success");
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-md text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Đã giao xong
                  </button>
                )}

                {/* Nút Lưu thay đổi */}
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 rounded-md text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                  Lưu thay đổi
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}