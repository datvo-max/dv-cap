import React, { useState, useEffect } from "react";
import { MatchingRecord, CardRecord } from "@/shared/lib/db";
import { X, CheckCircle, Sliders, ArrowRight, CheckSquare, Square } from "lucide-react";

interface SelectFieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchingRecord: MatchingRecord | null;
  oldCard: CardRecord | null;
  onConfirm: (matchingId: number, selectedUpdates: Partial<CardRecord>) => void;
}

const formatDateStr = (dateStr?: string) => {
  if (!dateStr) return "-";
  if (dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
    return `${dateStr.slice(0, 2)}-${dateStr.slice(2, 4)}-${dateStr.slice(4)}`;
  }
  return dateStr;
};

const FIELDS_TO_COMPARE: { key: keyof MatchingRecord; cardKey: keyof CardRecord; label: string }[] = [
  { key: "fullName", cardKey: "fullName", label: "Họ và Tên" },
  { key: "issueDate", cardKey: "issueDate", label: "Ngày Cấp" },
  { key: "dob", cardKey: "dob", label: "Ngày Sinh" },
  { key: "gender", cardKey: "gender", label: "Giới Tính" },
  { key: "address", cardKey: "address", label: "Địa Chỉ" },
  { key: "fatherName", cardKey: "fatherName", label: "Họ Tên Cha" },
  { key: "motherName", cardKey: "motherName", label: "Họ Tên Mẹ" },
];

export default function SelectFieldsModal({
  isOpen,
  onClose,
  matchingRecord,
  oldCard,
  onConfirm,
}: SelectFieldsModalProps) {
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (matchingRecord && oldCard && isOpen) {
      const initialSelected: Record<string, boolean> = {};
      FIELDS_TO_COMPARE.forEach(({ key, cardKey }) => {
        const newVal = matchingRecord[key] as string | undefined;
        const oldVal = oldCard[cardKey] as string | undefined;
        const isDiff = Boolean(newVal !== oldVal && newVal && newVal !== "-" && newVal !== "Chưa rõ");
        // Mặc định tự động tích chọn các trường có sự khác biệt
        initialSelected[key] = isDiff;
      });
      setSelectedFields(initialSelected);
    }
  }, [matchingRecord, oldCard, isOpen]);

  if (!isOpen || !matchingRecord || !oldCard) return null;

  const handleToggleField = (key: string) => {
    setSelectedFields((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAll = () => {
    const updated: Record<string, boolean> = {};
    FIELDS_TO_COMPARE.forEach(({ key, cardKey }) => {
      const newVal = matchingRecord[key] as string | undefined;
      const oldVal = oldCard[cardKey] as string | undefined;
      const isDiff = Boolean(newVal !== oldVal && newVal && newVal !== "-" && newVal !== "Chưa rõ");
      if (isDiff) updated[key] = true;
    });
    setSelectedFields(updated);
  };

  const handleDeselectAll = () => {
    const updated: Record<string, boolean> = {};
    FIELDS_TO_COMPARE.forEach(({ key }) => {
      updated[key] = false;
    });
    setSelectedFields(updated);
  };

  const handleConfirm = () => {
    const updates: Partial<CardRecord> = {};
    FIELDS_TO_COMPARE.forEach(({ key, cardKey }) => {
      if (selectedFields[key] && matchingRecord[key] && matchingRecord[key] !== "-" && matchingRecord[key] !== "Chưa rõ") {
        (updates as any)[cardKey] = matchingRecord[key];
      }
    });
    onConfirm(matchingRecord.id!, updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-blue-200" />
            <div>
              <h3 className="font-bold text-lg leading-tight">Chọn Trường Thông Tin Cập Nhật</h3>
              <p className="text-xs text-blue-100">Số ĐDCN: <span className="font-mono font-bold text-white">{matchingRecord.idNumber}</span> | Vị trí: Hộp {oldCard.zone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action shortcuts */}
        <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs">
          <span className="text-gray-600 font-medium flex items-center flex-wrap">
            Tích chọn <span className="inline-flex items-center mx-1">(<CheckSquare className="w-4 h-4 text-blue-600 mx-0.5" />)</span> vào các trường muốn dùng dữ liệu mới nạp:
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded border border-blue-200 transition-colors"
            >
              Chọn tất cả mới
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-2.5 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold rounded border border-gray-300 transition-colors"
            >
              Giữ tất cả cũ
            </button>
          </div>
        </div>

        {/* Fields list */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {FIELDS_TO_COMPARE.map(({ key, cardKey, label }) => {
            const newVal = matchingRecord[key] as string | undefined;
            const oldVal = oldCard[cardKey] as string | undefined;
            const isDiff = Boolean(newVal !== oldVal && newVal && newVal !== "-" && newVal !== "Chưa rõ");
            const isChecked = !!selectedFields[key];

            const displayNewVal = (key === "dob" || key === "issueDate") ? formatDateStr(newVal) : (newVal || "-");
            const displayOldVal = (key === "dob" || key === "issueDate") ? formatDateStr(oldVal) : (oldVal || "-");

            return (
              <div
                key={key}
                onClick={() => isDiff && handleToggleField(key)}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                  !isDiff
                    ? "bg-gray-50 border-gray-200 opacity-60 cursor-default"
                    : isChecked
                    ? "bg-blue-50/70 border-blue-300 shadow-sm cursor-pointer"
                    : "bg-white border-gray-200 hover:border-gray-300 cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3 w-1/4 min-w-[110px]">
                  {isDiff ? (
                    isChecked ? (
                      <CheckSquare className="w-5 h-5 text-blue-600 shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400 shrink-0" />
                    )
                  ) : (
                    <span className="w-5 h-5 flex items-center justify-center text-gray-400 text-xs font-bold">✓</span>
                  )}
                  <span className={`text-sm font-bold ${isDiff ? "text-gray-900" : "text-gray-500"}`}>
                    {label}
                  </span>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-3 items-center text-xs">
                  {/* Dữ liệu Kho hiện tại */}
                  <div className="bg-gray-100/80 p-2 rounded-lg border border-gray-200/60">
                    <span className="text-[10px] text-gray-400 block uppercase font-semibold">Kho hiện tại (Cũ)</span>
                    <span className="font-semibold text-gray-700 text-sm break-words">{displayOldVal}</span>
                  </div>

                  {/* Dữ liệu Mới nạp */}
                  <div className={`p-2 rounded-lg border flex items-center justify-between ${
                    isDiff
                      ? isChecked
                        ? "bg-blue-100/80 border-blue-300 text-blue-950 font-bold shadow-inner"
                        : "bg-amber-50 border-amber-200 text-amber-900 font-semibold"
                      : "bg-gray-50 border-gray-200 text-gray-500 font-medium"
                  }`}>
                    <div>
                      <span className="text-[10px] opacity-70 block uppercase font-semibold">Dữ liệu mới nạp</span>
                      <span className="text-sm break-words">{displayNewVal}</span>
                    </div>
                    {isDiff && isChecked && (
                      <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                        Cập nhật
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors text-sm shadow-sm"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all text-sm shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Xác nhận cập nhật
          </button>
        </div>

      </div>
    </div>
  );
}
