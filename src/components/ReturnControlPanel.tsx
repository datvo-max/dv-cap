// src/components/ReturnControlPanel.tsx
import React from "react";

interface ReturnControlPanelProps {
  onImportExcel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importInputRef: React.RefObject<HTMLInputElement | null>;
  onImportScannerInput: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onStartWebcam: (action: 'import' | 'return') => void;
  returnInputRef: React.RefObject<HTMLInputElement | null>;
  onReturnScannerInput: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onExportExcel: (type: 'all' | 'returned' | 'pending') => void;
  onBackupDatabase: () => void;
  onRestoreDatabase: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRequestClearData: () => void;
}

export default function ReturnControlPanel(props: ReturnControlPanelProps) {
  return (
    <>
      {/* 📥 KHỐI 1: NẠP DỮ LIỆU */}
      <div className="bg-blue-50/40 p-3 rounded-lg border border-blue-100 flex flex-col gap-3">
        <p className="text-[11px] font-bold text-blue-700 uppercase flex items-center gap-1.5 mb-1">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          Thêm thẻ vào kho
        </p>

        <button className="w-full relative flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-xs shadow-sm">
          Nạp từ file Excel (Danh sách)
          <input type="file" accept=".xlsx, .xls" onChange={props.onImportExcel} className="absolute inset-0 opacity-0 cursor-pointer" />
        </button>

        <input
          ref={props.importInputRef}
          onKeyDown={props.onImportScannerInput}
          placeholder="🔫 Click vào đây khi quét thẻ để thêm ..."
          className="w-full pl-3 pr-3 py-2 border border-blue-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          title="Nạp lẻ bằng máy quét phần cứng"
        />

        <button
          onClick={() => props.onStartWebcam('import')}
          className="w-full py-2 rounded-md font-bold text-xs border transition-colors shadow-sm bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
        >
          📸 Mở Camera Để Thêm Thẻ Thủ Công
        </button>
      </div>

      {/* 📤 KHỐI 2: TRẢ THẺ */}
      <div className="bg-green-50/40 p-3 rounded-lg border border-green-100 flex flex-col gap-3">
        <p className="text-[11px] font-bold text-green-700 uppercase flex items-center gap-1.5 mb-1">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Xác nhận trả thẻ
        </p>

        <input
          ref={props.returnInputRef}
          onKeyDown={props.onReturnScannerInput}
          placeholder="🔫 Click vào đây khi quét thẻ để trả ..."
          className="w-full pl-3 pr-3 py-2 border border-green-200 rounded-md text-xs focus:ring-2 focus:ring-green-500 outline-none"
          title="Trả thẻ bằng máy quét phần cứng"
        />

        <button
          onClick={() => props.onStartWebcam('return')}
          className="w-full py-2 rounded-md font-bold text-xs border transition-colors shadow-sm bg-white text-green-700 border-green-300 hover:bg-green-50"
        >
          📸 Mở Camera Trả Thẻ
        </button>
      </div>

      {/* 📊 KHỐI 3: XUẤT BÁO CÁO EXCEL */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <p className="text-[11px] font-bold text-gray-500 uppercase mb-2">Tải báo cáo (Danh Sách)</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => props.onExportExcel('pending')} className="bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold py-1.5 px-2 rounded text-[11px] border border-orange-200 transition-colors">⬇ Tải xuống Còn lại</button>
          <button onClick={() => props.onExportExcel('returned')} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-1.5 px-2 rounded text-[11px] border border-emerald-200 transition-colors">⬇ Tải xuống Đã trả</button>
          <button onClick={() => props.onExportExcel('all')} className="col-span-2 bg-white hover:bg-gray-100 text-gray-700 font-bold py-1.5 px-2 rounded text-[11px] border border-gray-300 transition-colors">⬇ Tải xuống Toàn bộ Kho</button>
        </div>
      </div>

      {/* ⚙️ KHỐI 4: QUẢN TRỊ HỆ THỐNG */}
      <div className="bg-purple-50/40 p-3 rounded-lg border border-purple-200 mt-4">
        <p className="text-[11px] font-bold text-purple-700 uppercase mb-2">Quản trị Hệ thống (Sao Lưu / Khôi Phục / Reset)</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={props.onBackupDatabase}
            className="bg-white hover:bg-purple-50 text-purple-700 font-bold py-2 px-2 rounded text-xs border border-purple-300 transition-colors shadow-sm"
          >
            💾 Tải File Sao Lưu
          </button>
          <label className="bg-white hover:bg-purple-50 text-purple-700 font-bold py-2 px-2 rounded text-xs border border-purple-300 transition-colors shadow-sm cursor-pointer text-center">
            🔄 Nạp File Khôi Phục
            <input type="file" accept=".json" onChange={props.onRestoreDatabase} className="hidden" />
          </label>
          <button
            onClick={props.onRequestClearData}
            className="col-span-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-1.5 px-2 rounded text-[11px] border border-red-200 transition-colors shadow-sm mt-1"
          >
            🗑️ Xóa Toàn Bộ Dữ Liệu Kho
          </button>
        </div>
      </div>
    </>
  );
}