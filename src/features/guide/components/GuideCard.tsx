import { Lightbulb, ArrowRight } from "lucide-react";
import { ToolGuideItem, NavigatableTab } from "../types";

interface GuideCardProps {
  item: ToolGuideItem;
  onNavigateTab: (tab: NavigatableTab) => void;
}

export default function GuideCard({ item, onNavigateTab }: GuideCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full group">
      {/* Card Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/40 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-200/80 group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
            {item.icon}
          </div>
          <div className="space-y-1">
            <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-extrabold border ${item.badgeColor}`}>
              {item.badge}
            </span>
            <h4 className="text-base font-bold text-gray-800 group-hover:text-emerald-700 transition-colors leading-snug">
              {item.title}
            </h4>
          </div>
        </div>
      </div>

      {/* Card Body - Summary & Steps */}
      <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100 font-normal">
            {item.summary}
          </p>

          <div className="space-y-2.5">
            <h5 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Quy Trình &amp; Thao Tác Thực Hiện:
            </h5>
            <ul className="space-y-2 text-sm text-gray-700 pl-1">
              {item.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tips Callout */}
          {item.tips && item.tips.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 space-y-1.5 text-amber-900 text-xs">
              <div className="font-extrabold flex items-center gap-1.5 text-amber-800">
                <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Mẹo Thực Hành Nhanh:</span>
              </div>
              {item.tips.map((tip, idx) => (
                <p key={idx} className="leading-relaxed pl-5 font-medium text-amber-800/90">
                  • {tip}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Card Footer - Target Navigation Button */}
        {item.targetTab && (
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => item.targetTab && onNavigateTab(item.targetTab)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-xs font-bold rounded-xl border border-emerald-200 hover:border-emerald-600 transition-all duration-200 shadow-sm group/btn"
            >
              <span>Mở ngay thao tác tại Tab</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
