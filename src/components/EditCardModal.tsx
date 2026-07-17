// src/components/EditCardModal.tsx
import React, { useState, useEffect, useRef } from "react";
import { db, CardRecord } from "@/lib/db";
import { parseCCCD } from "@/utils/cccdParser";

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
  const [cardData, setCardData] = useState<Partial<CardRecord>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [scanValue, setScanValue] = useState("");
  const scannerInputRef = useRef<HTMLInputElement>(null);

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isConfirmingUndo, setIsConfirmingUndo] = useState(false); // MỚI: State cho pop-up hoàn tác

  useEffect(() => {
    async function loadCardData() {
      if (isOpen && cardId) {
        setIsLoading(true);
        setIsScanning(false);
        setScanValue("");
        setIsConfirmingDelete(false);
        setIsConfirmingUndo(false); // Đóng pop-up cũ khi mở thẻ mới
        const card = await db.cards.get(cardId);
        if (card) {
          setPhoneNumber(card.phoneNumber || "");
          setIsNoPhoto(!!card.isNoPhoto);
          setCardData(card);
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

  const handleSave = () => {
    onSave(cardId, { ...cardData, phoneNumber, isNoPhoto });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

        <div className="bg-indigo-600 px-5 py-3 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm">Chỉnh sửa thông tin thẻ</h3>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {isLoading ? (
            <div className="text-center py-4 text-gray-500 text-sm">Đang tải dữ liệu...</div>
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
            </>
          )}
        </div>

        <div className="bg-gray-50 px-5 py-3 border-t flex justify-between gap-2">

          {/* KHU VỰC NÚT BÊN TRÁI: XÓA & HOÀN TÁC */}
          <div className="flex gap-2">
            <div className="relative">
              {isConfirmingDelete && (
                <div className="absolute bottom-full left-0 mb-2 bg-white border border-red-200 shadow-xl rounded-lg p-2 flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200 whitespace-nowrap">
                  <span className="text-xs text-red-600 font-bold px-1">Xóa thẻ này khỏi kho?</span>
                  <button
                    onClick={() => onDelete(cardId)}
                    className="px-2 py-1.5 bg-red-500 text-white text-[11px] font-bold rounded shadow-sm hover:bg-red-600"
                  >Xóa</button>
                  <button
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2 py-1.5 bg-gray-100 text-gray-600 text-[11px] font-bold rounded hover:bg-gray-200"
                  >Hủy</button>
                  <div className="absolute -bottom-1 left-4 w-2 h-2 bg-white border-b border-r border-red-200 transform rotate-45"></div>
                </div>
              )}
              <button
                onClick={() => setIsConfirmingDelete(true)}
                className="px-3 py-2 rounded-md text-sm font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                Xóa
              </button>
            </div>

            {/* MỚI: NÚT HOÀN TÁC (Chỉ hiển thị nếu thẻ đang ở trạng thái 'returned') */}
            {cardData.status === 'returned' && (
              <div className="relative">
                {isConfirmingUndo && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white border border-orange-200 shadow-xl rounded-lg p-2 flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200 whitespace-nowrap">
                    <span className="text-xs text-orange-600 font-bold px-1">Trả thẻ này lại vào kho?</span>
                    <button
                      onClick={() => { onUndoReturn(cardId); onClose(); }}
                      className="px-2 py-1.5 bg-orange-500 text-white text-[11px] font-bold rounded shadow-sm hover:bg-orange-600"
                    >Xác nhận</button>
                    <button
                      onClick={() => setIsConfirmingUndo(false)}
                      className="px-2 py-1.5 bg-gray-100 text-gray-600 text-[11px] font-bold rounded hover:bg-gray-200"
                    >Hủy</button>
                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-white border-b border-r border-orange-200 transform rotate-45"></div>
                  </div>
                )}
                <button
                  onClick={() => setIsConfirmingUndo(true)}
                  className="px-3 py-2 rounded-md text-sm font-bold text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                  Trả lại kho
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {/* <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors">
              Hủy bỏ
            </button> */}
            <button onClick={handleSave} className="px-4 py-2 rounded-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm">
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}