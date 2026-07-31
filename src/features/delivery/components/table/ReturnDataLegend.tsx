import React from "react";
import { CheckCircle, Truck, Archive, Phone, Image } from "lucide-react";

export default function ReturnDataLegend() {
  return (
    <div className="px-4 py-2.5 bg-gray-50/90 border-b border-gray-200 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-gray-600">
      <span className="font-bold text-gray-700 flex items-center gap-1">
        💡 Chú thích trạng thái:
      </span>
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="flex items-center gap-1 font-medium" title="Thẻ đã được bàn giao cho công dân">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline" /> Đã trả
        </span>
        <span className="flex items-center gap-1 font-medium" title="Thẻ đang được giao bởi shipper">
          <Truck className="w-3.5 h-3.5 text-amber-600 inline" /> Đang giao
        </span>
        <span className="flex items-center gap-1 font-medium" title="Thẻ vẫn đang lưu trong kho">
          <Archive className="w-3.5 h-3.5 text-indigo-600 inline" /> Trong kho
        </span>
      </div>
      <span className="text-gray-300">|</span>
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="flex items-center gap-1 font-medium" title="Đã có số điện thoại liên hệ">
          <Phone className="w-3.5 h-3.5 text-blue-600 inline" /> Có SĐT
        </span>
        <span className="flex items-center gap-1 font-medium" title="Chưa có số điện thoại liên hệ">
          <Phone className="w-3.5 h-3.5 text-gray-300 inline" /> Chưa SĐT
        </span>
      </div>
      <span className="text-gray-300">|</span>
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="flex items-center gap-1 font-medium" title="Chưa có ảnh đính kèm (0/4)">
          <Image className="w-3.5 h-3.5 text-gray-300 inline" /> 0 ảnh
        </span>
        <span className="flex items-center gap-1 font-medium" title="Đã có từ 1 đến 3 ảnh đính kèm">
          <Image className="w-3.5 h-3.5 text-amber-500 inline" /> 1-3 ảnh
        </span>
        <span className="flex items-center gap-1 font-medium" title="Đã có đủ 4 ảnh đính kèm">
          <Image className="w-3.5 h-3.5 text-emerald-600 inline" /> Đủ 4 ảnh
        </span>
      </div>
    </div>
  );
}
