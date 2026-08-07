import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx-js-style";
import { X } from "lucide-react";
import BoxManagementPanel from "./BoxManagementPanel";

interface ReturnControlPanelProps {
  onImportExcel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importInputRef: React.RefObject<HTMLInputElement | null>;
  onImportScannerInput: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onStartWebcam: (action: 'import' | 'return') => void;
  returnInputRef: React.RefObject<HTMLInputElement | null>;
  onReturnScannerInput: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onExportExcel: (type: 'all' | 'returned' | 'pending') => void;
  isNoPhotoImport: boolean;
  onToggleNoPhotoImport: (val: boolean) => void;
  onForceNextBox: () => void;
  onOpenMergeModal: () => void;
  onOpenRenameModal: () => void;
  isForceNextBox: boolean;
  cardsInCurrentBox: number;
  cardsPerBox: number;
  nextBoxName: string | number;
}

export default function ReturnControlPanel({
  onImportExcel,
  importInputRef,
  onImportScannerInput,
  onStartWebcam,
  returnInputRef,
  onReturnScannerInput,
  onExportExcel,
  isNoPhotoImport,
  onToggleNoPhotoImport,
  onForceNextBox,
  onOpenMergeModal,
  onOpenRenameModal,
  isForceNextBox,
  nextBoxName,
  cardsInCurrentBox,
  cardsPerBox
}: ReturnControlPanelProps) {
  const [activeFocus, setActiveFocus] = useState<'import' | 'return' | null>(null);
  const [activeModal, setActiveModal] = useState<'import' | 'return' | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownloadTemplate = () => {
    const ws_data = [
      ["Số CCCD", "Họ và Tên", "Ngày Sinh", "Giới Tính", "Địa Chỉ", "Ngày Cấp", "Họ Tên Cha", "Họ Tên Mẹ"],
      ["079090123456", "Nguyễn Văn A", "01011990", "Nam", "1 NVC, Phường Tân An, Thành phố Cần Thơ", "15052024", "Nguyễn Văn B", "Trần Thị C"]
    ];

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wscols = [
      { wch: 18 }, { wch: 25 }, { wch: 15 }, { wch: 12 },
      { wch: 40 }, { wch: 15 }, { wch: 20 }, { wch: 20 }
    ];
    ws['!cols'] = wscols;

    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "2563EB" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { auto: 1 } },
        bottom: { style: "thin", color: { auto: 1 } },
        left: { style: "thin", color: { auto: 1 } },
        right: { style: "thin", color: { auto: 1 } }
      }
    };

    for (let C = 0; C < ws_data[0].length; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = headerStyle;
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mau_Danh_Sach");
    XLSX.writeFile(wb, "File_Mau_Nhap_The_CCCD.xlsx");
  };

  return (
    <>
      <button 
        onClick={() => setActiveModal('import')}
        className="w-full py-3 px-4 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-bold text-sm text-left flex items-center gap-2 transition-colors shadow-sm"
      >
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
        Thêm thẻ vào kho
      </button>
      
      <button 
        onClick={() => setActiveModal('return')}
        className="w-full py-3 px-4 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg font-bold text-sm text-left flex items-center gap-2 transition-colors shadow-sm mt-3"
      >
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Xác nhận trả thẻ
      </button>

      {/* Modals for Import */}
      {mounted && activeModal === 'import' && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-blue-100 bg-blue-50/80 rounded-t-xl">
              <h2 className="font-bold text-lg text-blue-800 flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                Thêm thẻ vào kho
              </h2>
              <button onClick={() => setActiveModal(null)} className="p-1.5 hover:bg-blue-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-blue-600" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex flex-col gap-5 bg-white rounded-b-xl">
              
              {/* PHẦN A: NẠP EXCEL */}
              <div className="bg-white p-3 rounded-md border border-blue-200 shadow-sm flex flex-col gap-2">
                <p className="text-sm font-bold text-blue-700 uppercase flex items-center gap-1.5 border-b border-blue-100 pb-1 mb-1">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  Nạp danh sách từ Excel
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 relative flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-md transition-colors text-[11px] shadow-sm">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9"></path></svg>
                    Nạp từ Excel
                    <input type="file" accept=".xlsx, .xls" onChange={(e) => {
                      onImportExcel(e);
                      setActiveModal(null);
                    }} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </button>

                  <button
                    onClick={handleDownloadTemplate}
                    className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-600 font-bold py-2 px-3 rounded-md transition-colors text-[11px] shadow-sm"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Tải File Mẫu
                  </button>
                </div>
              </div>

              {/* PHẦN B: NẠP THỦ CÔNG (QUÉT/CAMERA) */}
              <div className="bg-white p-3 rounded-md border border-blue-200 shadow-sm flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-blue-100 pb-2">
                  <p className="text-sm font-bold text-blue-700 uppercase flex items-center gap-1.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                    Thêm thủ công
                  </p>
                  <div className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded text-[10px] font-bold text-blue-800 shadow-inner">
                    <span>Hộp hiện tại: <span className="text-blue-900 text-[11px]">{nextBoxName}</span></span>
                    <span className="text-blue-300">|</span>
                    <span>SL: <span className={`${cardsInCurrentBox >= (cardsPerBox - 5) ? 'text-red-600' : 'text-blue-900'}`}>{cardsInCurrentBox}/{cardsPerBox}</span></span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer bg-blue-100/50 p-1.5 rounded border border-blue-200 hover:bg-blue-100 transition-colors flex-1">
                    <input
                      type="checkbox"
                      checked={isNoPhotoImport}
                      onChange={(e) => onToggleNoPhotoImport(e.target.checked)}
                      className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-[10px] font-bold text-blue-800">Thẻ không ảnh</span>
                  </label>

                  <button
                    onClick={onForceNextBox}
                    className={`flex items-center justify-center gap-1 border transition-colors p-1.5 rounded flex-1 shadow-sm ${isForceNextBox
                      ? "bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                      : "bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                      }`}
                  >
                    <span className="text-[10px] font-bold">
                      {isForceNextBox ? `❌ Hủy sang hộp mới` : "📦 Sang hộp mới"}
                    </span>
                  </button>
                </div>

                {/* Ô quét nạp thẻ */}
                <div className={`transition-all duration-200 rounded-lg ${activeFocus === 'import'
                  ? 'border-2 border-dashed border-blue-500 bg-white shadow-sm'
                  : 'border border-blue-200 bg-white rounded-md'
                  }`}>
                  <input
                    ref={importInputRef}
                    onKeyDown={onImportScannerInput}
                    onFocus={() => setActiveFocus('import')}
                    onBlur={() => setActiveFocus(null)}
                    placeholder={activeFocus === 'import' ? "🔫 Đang đợi dữ liệu từ máy quét..." : "🔫 Click vào đây và quét thẻ để thêm ..."}
                    className={`w-full pl-3 pr-3 py-1.5 text-xs outline-none font-medium ${activeFocus === 'import' ? 'text-blue-700 placeholder:text-blue-400 placeholder:animate-pulse' : 'text-blue-900'
                      }`}
                    title="Nạp lẻ bằng máy quét phần cứng"
                  />
                </div>

                <button
                  onClick={() => {
                    onStartWebcam('import');
                    setActiveModal(null);
                  }}
                  className="w-full py-2 rounded-md font-bold text-xs border transition-all duration-300 shadow-sm bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  📸 Mở Camera Để Quét Nạp
                </button>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modals for Return */}
      {mounted && activeModal === 'return' && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-green-100 bg-green-50/80 rounded-t-xl">
              <h2 className="font-bold text-lg text-green-800 flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Xác nhận trả thẻ
              </h2>
              <button onClick={() => setActiveModal(null)} className="p-1.5 hover:bg-green-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-green-600" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex flex-col gap-4 bg-white rounded-b-xl">
              <div className="bg-white p-3 rounded-md border border-green-200 shadow-sm flex flex-col gap-3">
                <p className="text-sm font-bold text-green-700 uppercase flex items-center gap-1.5 border-b border-green-100 pb-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                  Quét trả thẻ
                </p>

                {/* Ô quét trả thẻ */}
                <div className={`transition-all duration-200 rounded-lg ${activeFocus === 'return'
                  ? 'border-2 border-dashed border-green-500 bg-white shadow-sm'
                  : 'border border-green-200 bg-white rounded-md'
                  }`}>
                  <input
                    ref={returnInputRef}
                    onKeyDown={onReturnScannerInput}
                    onFocus={() => setActiveFocus('return')}
                    onBlur={() => setActiveFocus(null)}
                    placeholder={activeFocus === 'return' ? "🔫 Đang đợi dữ liệu từ máy quét..." : "🔫 Click vào đây và quét thẻ để trả ..."}
                    className={`w-full pl-3 pr-3 py-1.5 text-xs outline-none font-medium ${activeFocus === 'return' ? 'text-green-700 placeholder:text-green-500 placeholder:animate-pulse' : 'text-green-900'
                      }`}
                    title="Trả thẻ bằng máy quét phần cứng"
                  />
                </div>

                <button
                  onClick={() => {
                    onStartWebcam('return');
                    setActiveModal(null);
                  }}
                  className="w-full py-2 rounded-md font-bold text-xs border transition-all duration-300 shadow-sm bg-white text-green-700 border-green-300 hover:bg-green-50"
                >
                  📸 Mở Camera Trả Thẻ
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <p className="text-[11px] font-bold text-gray-500 uppercase mb-2">Tải báo cáo (Danh Sách)</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => onExportExcel('pending')} className="bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold py-1.5 px-2 rounded text-[11px] border border-orange-200 transition-colors">⬇ Tải xuống Còn lại</button>
          <button onClick={() => onExportExcel('returned')} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-1.5 px-2 rounded text-[11px] border border-emerald-200 transition-colors">⬇ Tải xuống Đã trả</button>
          <button onClick={() => onExportExcel('all')} className="col-span-2 bg-white hover:bg-gray-100 text-gray-700 font-bold py-1.5 px-2 rounded text-[11px] border border-gray-300 transition-colors">⬇ Tải xuống Toàn bộ Kho</button>
        </div>
      </div>

      <BoxManagementPanel
        onOpenMergeModal={onOpenMergeModal}
        onOpenRenameModal={onOpenRenameModal}
      />
    </>
  );
}