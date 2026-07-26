"use client";

import { useState, useMemo } from "react";
import { HelpCircle } from "lucide-react";
import { GuideSectionId, NavigatableTab } from "../types";
import { guideItems } from "../data/guideItems";
import GuideHeroSection from "./GuideHeroSection";
import GuideSidebar from "./GuideSidebar";
import GuideCard from "./GuideCard";
import GuideFooterSection from "./GuideFooterSection";

interface UserGuideTabProps {
  onNavigateTab: (tab: NavigatableTab) => void;
}

export default function UserGuideTab({ onNavigateTab }: UserGuideTabProps) {
  const [activeSection, setActiveSection] = useState<GuideSectionId>('all');
  const [searchQuery, setSearchQuery] = useState("");

  // Lọc danh sách theo Tab và từ khóa tìm kiếm
  const filteredItems = useMemo(() => {
    return guideItems.filter(item => {
      const matchesSection = activeSection === 'all' || item.sectionId === activeSection;
      if (!matchesSection) return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchSummary = item.summary.toLowerCase().includes(query);
      const matchSteps = item.steps.some(step => step.toLowerCase().includes(query));
      const matchKeywords = item.keywords.some(kw => kw.toLowerCase().includes(query));

      return matchTitle || matchSummary || matchSteps || matchKeywords;
    });
  }, [activeSection, searchQuery]);

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">

      <GuideHeroSection />

      {/* --- MAIN CONTENT AREA (2-COLUMN ON DESKTOP) --- */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        <GuideSidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          guideItems={guideItems}
        />

        {/* RIGHT COLUMN: GUIDE ITEMS GRID / LIST */}
        <div className="flex-1 w-full min-w-0">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm space-y-3">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto animate-bounce" />
              <h4 className="text-lg font-bold text-gray-700">Không tìm thấy tài liệu hướng dẫn phù hợp</h4>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Không có công cụ nào khớp với từ khóa <span className="font-semibold text-emerald-600">&quot;{searchQuery}&quot;</span> trong phần đã chọn. Hãy thử tìm từ khóa ngắn gọn hơn như &quot;excel&quot;, &quot;qr&quot;, &quot;hộp&quot;, &quot;backup&quot;.
              </p>
              <button
                onClick={() => { setSearchQuery(""); setActiveSection("all"); }}
                className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                Xem lại tất cả bài viết
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {filteredItems.map((item) => (
                <GuideCard key={item.id} item={item} onNavigateTab={onNavigateTab} />
              ))}
            </div>
          )}
        </div>
      </div>

      <GuideFooterSection onNavigateTab={onNavigateTab} />

    </div>
  );
}
