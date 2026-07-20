import React from "react";
import * as XLSX from "xlsx-js-style";
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
  nextBoxName: string;
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
  nextBoxName
}: ReturnControlPanelProps) {
  const handleDownloadTemplate = () => {
    const ws_data = [
      ["Số CCCD", "Họ và Tên", "Ngày Sinh", "Giới Tính", "Địa Chỉ", "Ngày Cấp", "Họ Tên Cha", "Họ Tên Mẹ"],
      ["079090123456", "Nguyễn Văn A", "01/01/1990", "Nam", "Phường 1, Tân An, Long An", "15/05/2024", "Nguyễn Văn B", "Trần Thị C"]
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
      <div className="bg-blue-50/40 p-3 rounded-lg border border-blue-100 flex flex-col gap-3">
        <p className="text-[11px] font-bold text-blue-700 uppercase flex items-center gap-1.5 mb-1">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          Thêm thẻ vào kho
        </p>

        <div className="flex gap-2">
          <button className="flex-1 relative flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-md transition-colors text-[11px] shadow-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9"></path></svg>
            Nạp từ Excel
            <input type="file" accept=".xlsx, .xls" onChange={onImportExcel} className="absolute inset-0 opacity-0 cursor-pointer" />
          </button>
          
          <button 
            onClick={handleDownloadTemplate} 
            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-600 font-bold py-2 px-3 rounded-md transition-colors text-[11px] shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Tải File Mẫu
          </button>
        </div>

        <input
          ref={importInputRef}
          onKeyDown={onImportScannerInput}
          placeholder="🔫 Click vào đây khi quét thẻ để thêm ..."
          className="w-full pl-3 pr-3 py-2 border border-blue-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          title="Nạp lẻ bằng máy quét phần cứng"
        />
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
            disabled={isForceNextBox}
            className={`flex items-center justify-center gap-1 border transition-colors p-1.5 rounded flex-1 shadow-sm ${
              isForceNextBox 
                ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" 
                : "bg-white border-blue-300 text-blue-700 hover:bg-blue-100"
            }`}
          >
            <span className="text-[10px] font-bold">
              {isForceNextBox ? `🎯 Kế tiếp: Hộp ${nextBoxName}` : "📦 Sang hộp mới"}
            </span>
          </button>
        </div>

        <button
          onClick={() => onStartWebcam('import')}
          className="w-full py-2 rounded-md font-bold text-xs border transition-colors shadow-sm bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
        >
          📸 Mở Camera Để Thêm Thẻ Thủ Công
        </button>
      </div>

      <div className="bg-green-50/40 p-3 rounded-lg border border-green-100 flex flex-col gap-3">
        <p className="text-[11px] font-bold text-green-700 uppercase flex items-center gap-1.5 mb-1">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Xác nhận trả thẻ
        </p>

        <input
          ref={returnInputRef}
          onKeyDown={onReturnScannerInput}
          placeholder="🔫 Click vào đây khi quét thẻ để trả ..."
          className="w-full pl-3 pr-3 py-2 border border-green-200 rounded-md text-xs focus:ring-2 focus:ring-green-500 outline-none"
          title="Trả thẻ bằng máy quét phần cứng"
        />

        <button
          onClick={() => onStartWebcam('return')}
          className="w-full py-2 rounded-md font-bold text-xs border transition-colors shadow-sm bg-white text-green-700 border-green-300 hover:bg-green-50"
        >
          📸 Mở Camera Trả Thẻ
        </button>
      </div>

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