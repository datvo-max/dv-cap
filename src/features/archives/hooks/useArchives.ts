import { useState, useRef, useMemo, KeyboardEvent, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, CardRecord, ArchiveRecord } from '@/shared/lib/db';
import toast from 'react-hot-toast';

export function useArchives() {
  const [searchId, setSearchId] = useState('');
  const [suggestions, setSuggestions] = useState<CardRecord[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [isManualFormOpen, setIsManualFormOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    idNumber: '',
    fullName: '',
    dob: '',
    address: '',
    phoneNumber: ''
  });

  // Fetch Archives list
  const archivesData = useLiveQuery(() => db.archives.reverse().toArray(), []) || [];

  // DataTable State
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ref cho input search
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Tính giới tính dựa vào chữ số thứ 4 của số ĐDCN (từ 0) -> là index 3
  // số chẵn: nam, số lẻ: nữ
  const getGenderFromIdNumber = (idStr: string) => {
    if (idStr.length < 4) return '';
    const char = idStr[3];
    const num = parseInt(char, 10);
    if (isNaN(num)) return '';
    return num % 2 === 0 ? 'Nam' : 'Nữ';
  };

  const handleSearchChange = async (val: string) => {
    const newVal = val.replace(/[^0-9]/g, '');
    setSearchId(newVal);

    if (newVal.length >= 4) {
      // Tìm kiếm trong Kho thẻ (cards)
      try {
        const matches = await db.cards
          .filter(c => c.idNumber.includes(newVal))
          .limit(50) // Lấy nhiều hơn 20 một chút để bù trừ số bị lọc
          .toArray();
          
        // Lấy danh sách idNumber đã có trong Tàng thư
        const matchIds = matches.map(m => m.idNumber);
        const existingInArchives = await db.archives.where('idNumber').anyOf(matchIds).toArray();
        const existingSet = new Set(existingInArchives.map(a => a.idNumber));
        
        // Lọc bỏ những người đã có trong Tàng thư, và chỉ lấy tối đa 20 người
        const filteredMatches = matches.filter(m => !existingSet.has(m.idNumber)).slice(0, 20);
        
        setSuggestions(filteredMatches);
        setShowSuggestions(true);
        setSelectedIndex(0);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      
      if (showSuggestions && suggestions.length > 0) {
        // Chọn dòng đang active
        await handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (searchId.length === 12) {
        // Nếu gõ 12 số mà không có suggestion nào, mở form thêm thủ công
        const exactMatch = await db.cards.where('idNumber').equals(searchId).first();
        if (exactMatch) {
            await handleSelectSuggestion(exactMatch);
        } else {
            // Kiểm tra xem đã có trong Tàng thư chưa trước khi mở form
            const existingInArchive = await db.archives.where('idNumber').equals(searchId).first();
            if (existingInArchive) {
              toast.error(`Số ĐDCN ${searchId} đã tồn tại trong Tàng thư!`);
              setSearchId('');
              setShowSuggestions(false);
              return;
            }
            
            toast.error("Không tìm thấy trong Kho thẻ. Vui lòng nhập thủ công.");
            openManualForm(searchId);
        }
      }
    }
  };

  const handleSelectSuggestion = async (card: CardRecord) => {
    try {
      // Kiểm tra xem đã có trong archive chưa
      const existing = await db.archives.where('idNumber').equals(card.idNumber).first();
      if (existing) {
        toast.error(`Số ĐDCN ${card.idNumber} đã tồn tại trong Tàng thư!`);
        setSearchId('');
        setShowSuggestions(false);
        searchInputRef.current?.focus();
        return;
      }

      const newArchive: ArchiveRecord = {
        idNumber: card.idNumber,
        fullName: card.fullName,
        dob: card.dob.replace(/[^0-9]/g, ''), // Chỉ lưu số ddmmyyyy
        gender: getGenderFromIdNumber(card.idNumber),
        address: card.address,
        phoneNumber: card.phoneNumber || '',
        createdAt: Date.now()
      };

      await db.archives.add(newArchive);
      toast.success(`Đã thêm ${card.fullName} vào Tàng thư`);
      
      setSearchId('');
      setShowSuggestions(false);
      
      // Auto focus lại
      setTimeout(() => searchInputRef.current?.focus(), 100);

    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi lưu vào tàng thư');
    }
  };

  const openManualForm = (idStr: string) => {
    setManualForm({
      idNumber: idStr,
      fullName: '',
      dob: '',
      address: '',
      phoneNumber: ''
    });
    setIsManualFormOpen(true);
    setShowSuggestions(false);
    
    // Tự động focus vào ô Họ Tên sau khi render xong form
    setTimeout(() => {
      document.getElementById('archive-fullname-input')?.focus();
    }, 100);
  };

  const closeManualForm = () => {
    setIsManualFormOpen(false);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const submitManualForm = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (manualForm.idNumber.length !== 12) {
      toast.error("Số ĐDCN phải đủ 12 số!");
      return;
    }
    if (!manualForm.fullName.trim()) {
      toast.error("Họ tên không được để trống!");
      return;
    }
    try {
      const existing = await db.archives.where('idNumber').equals(manualForm.idNumber).first();
      if (existing) {
        toast.error(`Số ĐDCN ${manualForm.idNumber} đã tồn tại trong Tàng thư!`);
        return;
      }
      
      const newArchive: ArchiveRecord = {
        idNumber: manualForm.idNumber,
        fullName: manualForm.fullName,
        dob: manualForm.dob.replace(/[^0-9]/g, ''), // Chỉ lưu số ddmmyyyy
        gender: getGenderFromIdNumber(manualForm.idNumber),
        address: manualForm.address,
        phoneNumber: manualForm.phoneNumber,
        createdAt: Date.now()
      };

      await db.archives.add(newArchive);
      toast.success(`Đã thêm ${manualForm.fullName} vào Tàng thư`);
      closeManualForm();
      setSearchId('');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi lưu thủ công');
    }
  };

  // ----- BẢNG VÀ TÌM KIẾM -----
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return archivesData;
    const lower = searchTerm.toLowerCase();
    return archivesData.filter(item => 
      item.idNumber.includes(lower) || 
      item.fullName.toLowerCase().includes(lower)
    );
  }, [archivesData, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const currentData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const toggleSelectCard = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === currentData.length && currentData.length > 0) {
      setSelectedIds(new Set());
    } else {
      const next = new Set<number>();
      currentData.forEach(c => c.id && next.add(c.id));
      setSelectedIds(next);
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };
  
  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Bạn có chắc chắn muốn xoá ${selectedIds.size} hồ sơ khỏi tàng thư?`)) {
      try {
        const idsArray = Array.from(selectedIds);
        await db.archives.bulkDelete(idsArray);
        toast.success(`Đã xoá ${idsArray.length} hồ sơ`);
        clearSelection();
      } catch (err) {
        console.error(err);
        toast.error('Lỗi khi xoá dữ liệu');
      }
    }
  };

  return {
    searchId,
    setSearchId: handleSearchChange,
    searchInputRef,
    handleSearchKeyDown,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    selectedIndex,
    setSelectedIndex,
    handleSelectSuggestion,
    
    isManualFormOpen,
    manualForm,
    setManualForm,
    closeManualForm,
    submitManualForm,

    filteredData,
    currentData,
    searchTerm,
    setSearchTerm,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    totalPages,

    isSelectMode,
    setIsSelectMode,
    selectedIds,
    toggleSelectCard,
    toggleSelectAll,
    clearSelection,
    deleteSelected
  };
}
