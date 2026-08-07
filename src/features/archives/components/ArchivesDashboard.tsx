import React from 'react';
import ArchiveForm from './ArchiveForm';
import ArchiveAdvancedSearch from './ArchiveAdvancedSearch';
import ArchiveDataTable from './ArchiveDataTable';
import { useArchives } from '../hooks/useArchives';

export default function ArchivesDashboard() {
  const archives = useArchives();

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* CỘT TRÁI: FORM TÌM KIẾM & NHẬP THỦ CÔNG */}
      <div className="w-full lg:w-1/3 xl:w-1/4 lg:sticky lg:top-24">
        <ArchiveForm
          searchId={archives.searchId}
          setSearchId={archives.setSearchId}
          searchInputRef={archives.searchInputRef}
          handleSearchKeyDown={archives.handleSearchKeyDown}
          suggestions={archives.suggestions}
          showSuggestions={archives.showSuggestions}
          setShowSuggestions={archives.setShowSuggestions}
          selectedIndex={archives.selectedIndex}
          handleSelectSuggestion={archives.handleSelectSuggestion}
          
          isManualFormOpen={archives.isManualFormOpen}
          manualForm={archives.manualForm}
          setManualForm={archives.setManualForm}
          closeManualForm={archives.closeManualForm}
          submitManualForm={archives.submitManualForm}
        />
      </div>

      {/* CỘT PHẢI: DANH SÁCH TÀNG THƯ */}
      <div className="w-full lg:w-2/3 xl:w-3/4 flex flex-col h-[calc(100vh-140px)]">
        <ArchiveAdvancedSearch
          searchTerm={archives.searchTerm}
          setSearchTerm={archives.setSearchTerm}
          pageSize={archives.pageSize}
          setPageSize={archives.setPageSize}
          totalRecords={archives.filteredData.length}
        />
        
        <div className="flex-1 min-h-0">
          <ArchiveDataTable
            data={archives.currentData}
            allData={archives.filteredData}
            currentPage={archives.currentPage}
            totalPages={archives.totalPages}
            setCurrentPage={archives.setCurrentPage}
            
            isSelectMode={archives.isSelectMode}
            setIsSelectMode={archives.setIsSelectMode}
            selectedIds={archives.selectedIds}
            toggleSelectCard={archives.toggleSelectCard}
            toggleSelectAll={archives.toggleSelectAll}
            deleteSelected={archives.deleteSelected}
          />
        </div>
      </div>
      
    </div>
  );
}
