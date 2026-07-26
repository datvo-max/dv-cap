import { Sparkles } from "lucide-react";

export default function GuideHeroSection() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-8 lg:p-12 shadow-xl border border-emerald-500/30">
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase shadow-sm">
          <Sparkles className="w-4 h-4 animate-pulse text-emerald-400" />
          <span>Tài Liệu Hướng Dẫn Kỹ Thuật &amp; Nghiệp Vụ - 2026</span>
        </div>

        <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-teal-200">
          Hệ Thống Quản Lý &amp; Phát Thẻ Căn Cước Địa Phương (QL-TCC)
        </h2>

        <p className="text-base lg:text-lg text-emerald-100/90 leading-relaxed font-normal max-w-3xl">
          Tài liệu tổng hợp toàn diện giúp Cán bộ nắm vững toàn bộ tính năng của phần mềm: Từ quy trình quét mã QR nhập liệu tự động, tổ chức kho thẻ theo Box/Zone, quản lý bàn giao Shipper đến khả năng lưu trữ offline-first với IndexedDB.
        </p>

        {/* AUTHOR INFO BADGE IN HERO */}
        <div className="inline-flex flex-wrap items-center gap-3 sm:gap-4 bg-emerald-950/70 backdrop-blur-md px-4 py-3 rounded-2xl border border-emerald-400/40 text-xs sm:text-sm text-emerald-100 shadow-md">
          <div className="flex items-center gap-2 font-extrabold text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Tác giả / Phát triển: Võ Tấn Đạt</span>
          </div>
          <span className="hidden sm:inline text-emerald-500">•</span>
          <div className="flex items-center gap-1.5 text-emerald-100">
            <span className="text-emerald-300 font-semibold">Email:</span> williamdat10@gmail.com
          </div>
          <span className="hidden sm:inline text-emerald-500">•</span>
          <div className="flex items-center gap-1.5 text-amber-300 font-extrabold">
            <span>Zalo góp ý:</span> 0945235799
          </div>
        </div>

        {/* QUICK STATS & BADGES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-center items-center text-center">
            <span className="text-2xl font-black text-emerald-400">4+</span>
            <span className="text-xs font-medium text-emerald-100 mt-1">Phân Hệ Chuyên Sâu</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-center items-center text-center">
            <span className="text-2xl font-black text-teal-300">100%</span>
            <span className="text-xs font-medium text-emerald-100 mt-1">Lưu Trữ Offline-First</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-center items-center text-center">
            <span className="text-2xl font-black text-cyan-300">QR Code</span>
            <span className="text-xs font-medium text-emerald-100 mt-1">Quét Siêu Tốc 2D</span>
          </div>
        </div>
      </div>
    </div>
  );
}
