import { Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { NavigatableTab } from "../types";

interface GuideFooterSectionProps {
  onNavigateTab: (tab: NavigatableTab) => void;
}

export default function GuideFooterSection({ onNavigateTab }: GuideFooterSectionProps) {
  return (
    <>
      {/* --- DEVELOPER & SUPPORT CONTACT CARD --- */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white rounded-3xl p-6 md:p-8 border border-emerald-200/80 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Liên Hệ &amp; Hỗ Trợ Kỹ Thuật</span>
          </div>
          <h4 className="text-xl md:text-2xl font-black text-gray-800">
            Thông Tin Tác Giả &amp; Góp Ý Phát Triển
          </h4>
          <p className="text-sm text-gray-600 max-w-xl leading-relaxed font-normal">
            Phần mềm được phát triển nhằm tối ưu hóa hiệu quả nghiệp vụ quản lý, phát thẻ Căn cước. Nếu có bất kỳ ý kiến đóng góp, đề xuất nâng cấp tính năng hay cần hỗ trợ kỹ thuật trong quá trình sử dụng, xin vui lòng liên hệ:
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <a
            href="mailto:williamdat10@gmail.com"
            className="flex items-center justify-center gap-3 px-5 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm rounded-2xl border border-gray-200 shadow-sm hover:shadow transition-all duration-200 group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform font-black text-base">
              ✉
            </div>
            <div className="text-left">
              <div className="text-[10px] text-gray-400 uppercase font-semibold">Email Tác Giả</div>
              <div className="text-blue-600 font-extrabold text-sm">williamdat10@gmail.com</div>
            </div>
          </a>

          <a
            href="https://zalo.me/0945235799"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center group-hover:scale-110 transition-transform text-lg font-black">
              Z
            </div>
            <div className="text-left">
              <div className="text-[10px] text-blue-100 uppercase font-semibold">Zalo Hỗ Trợ &amp; Góp Ý</div>
              <div className="text-white font-extrabold text-base">0945.235.799 (Võ Tấn Đạt)</div>
            </div>
          </a>
        </div>
      </div>

      {/* --- BOTTOM HELP BANNER --- */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl p-6 lg:p-8 shadow-lg border border-emerald-800/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h4 className="text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Đã Sẵn Sàng Bắt Đầu?
          </h4>
          <p className="text-sm text-emerald-200/80 max-w-xl leading-relaxed">
            Hãy bắt đầu bằng việc chuyển sang *Phân hệ 1* để tiến hành quét nhập liệu danh sách Thẻ căn cước hoặc *Phân hệ 2* để cấu hình kho thẻ ngay hôm nay!
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => onNavigateTab('nhap-lieu')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all duration-200 flex items-center gap-2 transform hover:scale-105"
          >
            <span>📥 Vào Phân Hệ 1</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigateTab('tra-the')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all duration-200 flex items-center gap-2 transform hover:scale-105"
          >
            <span>📤 Vào Phân Hệ 2</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
