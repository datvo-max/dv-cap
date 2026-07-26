import { Search, BookOpen } from "lucide-react";
import { GuideSectionId, ToolGuideItem } from "../types";
import { GUIDE_SECTIONS } from "../data/guideItems";

interface GuideSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeSection: GuideSectionId;
  onSectionChange: (section: GuideSectionId) => void;
  guideItems: ToolGuideItem[];
}

export default function GuideSidebar({
  searchQuery,
  onSearchChange,
  activeSection,
  onSectionChange,
  guideItems,
}: GuideSidebarProps) {
  return (
    <div className="w-full lg:w-80 xl:w-96 lg:flex-shrink-0 lg:sticky lg:top-20 z-30 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-200 space-y-4 md:space-y-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto scrollbar-thin">
      <div className="flex flex-col md:flex-row lg:flex-col md:items-center lg:items-stretch justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Tra Cứu Hướng Dẫn Chức Năng</span>
          </h3>
          <p className="text-xs text-gray-500">
            Nhập từ khóa công cụ (ví dụ: <span className="font-semibold text-emerald-700">&quot;shipper&quot;</span>, <span className="font-semibold text-emerald-700">&quot;gộp hộp&quot;</span>, <span className="font-semibold text-emerald-700">&quot;webcam&quot;</span>, <span className="font-semibold text-emerald-700">&quot;sao lưu&quot;</span>...)
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80 lg:w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm công cụ, tính năng..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold bg-gray-200 hover:bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
              title="Xóa từ khóa"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Section Filter Pills */}
      <div className="flex flex-nowrap overflow-x-auto pb-2 -mx-2 px-2 gap-2 pt-2 border-t border-gray-100 md:flex-wrap md:overflow-visible md:pb-0 md:mx-0 md:px-0 lg:flex-col lg:items-stretch lg:gap-1.5 scrollbar-none">
        {GUIDE_SECTIONS.map((tab) => {
          const isActive = activeSection === tab.id;
          const count = tab.id === 'all'
            ? guideItems.length
            : guideItems.filter(i => i.sectionId === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => onSectionChange(tab.id)}
              className={`px-3.5 py-1.5 lg:py-2.5 rounded-lg lg:rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-1.5 whitespace-nowrap lg:whitespace-normal ${isActive
                ? "bg-emerald-600 text-white shadow-md transform scale-102 lg:scale-100"
                : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-200"
                }`}
            >
              <span className="text-left">{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] flex-shrink-0 font-extrabold ${isActive ? "bg-emerald-700 text-white" : "bg-gray-200 text-gray-600"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
