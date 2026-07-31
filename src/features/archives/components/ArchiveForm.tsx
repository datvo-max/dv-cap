import React from 'react';
import { Search, Save, X, PlusCircle } from 'lucide-react';
import SearchResultModal from './SearchResultModal';
import { CardRecord } from '@/shared/lib/db';

interface ArchiveFormProps {
  searchId: string;
  setSearchId: (val: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  handleSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  suggestions: CardRecord[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  selectedIndex: number;
  handleSelectSuggestion: (card: CardRecord) => void;

  isManualFormOpen: boolean;
  manualForm: {
    idNumber: string;
    fullName: string;
    dob: string;
    address: string;
    phoneNumber: string;
  };
  setManualForm: React.Dispatch<React.SetStateAction<{
    idNumber: string;
    fullName: string;
    dob: string;
    address: string;
    phoneNumber: string;
  }>>;
  closeManualForm: () => void;
  submitManualForm: (e: React.SyntheticEvent) => void;
}

export default function ArchiveForm({
  searchId, setSearchId, searchInputRef, handleSearchKeyDown,
  suggestions, showSuggestions, setShowSuggestions, selectedIndex, handleSelectSuggestion,
  isManualFormOpen, manualForm, setManualForm, closeManualForm, submitManualForm
}: ArchiveFormProps) {

  const handleDobBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (!val) return;

    const digits = val.replace(/[^0-9]/g, '');
    let dd = '', mm = '', yyyy = '';

    if (digits.length === 8) {
      dd = digits.substring(0, 2);
      mm = digits.substring(2, 4);
      yyyy = digits.substring(4, 8);
    } else if (digits.length === 6) {
      dd = digits.substring(0, 2);
      mm = digits.substring(2, 4);
      const yy = digits.substring(4, 6);

      const genderDigit = manualForm.idNumber[3];
      if (genderDigit === '0' || genderDigit === '1') {
        yyyy = '19' + yy;
      } else if (genderDigit === '2' || genderDigit === '3') {
        yyyy = '20' + yy;
      } else {
        yyyy = yy; // Fallback
      }
    } else if (digits.length === 4 && manualForm.idNumber.length >= 6) {
      dd = digits.substring(0, 2);
      mm = digits.substring(2, 4);
      const yy = manualForm.idNumber.substring(4, 6);

      const genderDigit = manualForm.idNumber[3];
      if (genderDigit === '0' || genderDigit === '1') {
        yyyy = '19' + yy;
      } else if (genderDigit === '2' || genderDigit === '3') {
        yyyy = '20' + yy;
      } else {
        yyyy = yy; // Fallback
      }
    } else {
      return; // Không đủ 4, 6 hoặc 8 số thì không format
    }

    setManualForm(prev => ({ ...prev, dob: `${dd}-${mm}-${yyyy}` }));
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          Tra cứu & Thêm mới
        </h2>
        <p className="text-sm text-gray-500">Nhập số ĐDCN (≥ 4 số) để tìm kiếm từ Kho thẻ hoặc tự động mở form nhập thủ công.</p>
      </div>

      {/* SEARCH SECTION */}
      {!isManualFormOpen && (
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Số Định danh cá nhân
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all"
              placeholder="Nhập số ĐDCN (VD: 001090...)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => {
                if (searchId.length >= 4) setShowSuggestions(true);
              }}
              onBlur={() => {
                // Đóng sau 1 chút để click không bị mất focus trước khi trigger
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              maxLength={12}
            />
          </div>

          <SearchResultModal
            isOpen={showSuggestions}
            onClose={() => setShowSuggestions(false)}
            suggestions={suggestions}
            selectedIndex={selectedIndex}
            onSelect={handleSelectSuggestion}
            searchTerm={searchId}
          />
        </div>
      )}

      {/* MANUAL INPUT FORM */}
      {isManualFormOpen && (
        <form onSubmit={submitManualForm} className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-2 border-b border-blue-100 pb-2">
            <h3 className="font-bold text-blue-800 flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Thêm mới thủ công
            </h3>
            <button type="button" onClick={closeManualForm} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Số Định danh (*)</label>
            <input
              type="text"
              required
              maxLength={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={manualForm.idNumber}
              onChange={e => setManualForm({ ...manualForm, idNumber: e.target.value.replace(/[^0-9]/g, '') })}
              placeholder="12 chữ số"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Họ và tên (*)</label>
            <input
              id="archive-fullname-input"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={manualForm.fullName}
              onChange={e => {
                const titleCase = e.target.value.toLowerCase().replace(/(?:^|\s)\S/g, match => match.toUpperCase());
                setManualForm({ ...manualForm, fullName: titleCase });
              }}
              placeholder="Nguyen Van A"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày sinh</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={manualForm.dob}
                onChange={e => setManualForm({ ...manualForm, dob: e.target.value })}
                onBlur={handleDobBlur}
                placeholder="dd-mm-yyyy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={manualForm.phoneNumber}
                onChange={e => setManualForm({ ...manualForm, phoneNumber: e.target.value.replace(/[^0-9]/g, '') })}
                placeholder="09..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nơi cư trú</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={manualForm.address}
              onChange={e => setManualForm({ ...manualForm, address: e.target.value })}
              placeholder="Nhập địa chỉ..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 mt-2 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Lưu vào Tàng thư
          </button>
        </form>
      )}

      {/* HƯỚNG DẪN */}
      <div className="mt-auto bg-gray-50 p-4 rounded-xl text-xs text-gray-600 border border-gray-100">
        <p className="font-bold mb-1 text-gray-800 flex items-center gap-1">💡 Hướng dẫn nhanh:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Nhập <b>≥ 4 số</b> để tìm kiếm trong kho thẻ.</li>
          <li>Sử dụng mũi tên <b>Lên/Xuống</b> và <b>Enter</b> để chọn nhanh.</li>
          <li>Nhập đủ 12 số không khớp hệ thống sẽ cho phép nhập thủ công.</li>
          <li>Nhập ngày sinh dạng <b>dd-mm-yyyy</b> hoặc <b>ddmmyy</b> hoặc <b>ddmmyyyy</b> (4-8 số) và <b>tab</b> ra để tự động format. (Nếu nhập 4 số <i>ddmm</i>, năm sinh sẽ tự trích xuất từ số ĐDCN).</li>
          <li>Giới tính được tự động cập nhật dựa trên số ĐDCN.</li>
        </ul>
      </div>
    </div>
  );
}
