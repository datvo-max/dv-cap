"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import logoImg from "../../../public/Logo-BCA.png";
import { useAuth } from "../context/AuthContext";
import { LogOut, ChevronDown, User as UserIcon, Settings } from "lucide-react";
import { useSettings } from "../hooks/useSettings";
import pkg from "../../../package.json";

interface HeaderProps {
  onOpenSettings?: () => void;
}

export default function Header({ onOpenSettings }: HeaderProps) {
  const { user, isGuest, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { unitName } = useSettings();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 p-2 flex justify-between items-center mb-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Image
          src={logoImg}
          alt="Logo Hệ Thống"
          className="w-10 h-10 object-contain"
        />
        <h1 className="text-xl font-bold text-blue-900">
          {unitName}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* User Profile Dropdown */}
        {(user || isGuest) && (
          <div className="relative ml-2" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200" />
              ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isGuest ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  <UserIcon className="w-5 h-5" />
                </div>
              )}
              <div className="hidden sm:flex flex-col items-start text-left">
                <span className="text-sm font-bold text-slate-700 leading-tight">
                  {isGuest ? "Chế độ Khách" : (user?.displayName || "Người dùng")}
                </span>
                <span className="text-[10px] text-slate-500 leading-tight">
                  {isGuest ? "Dùng thử hệ thống" : user?.email}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {/* Thông tin user (Chỉ hiện trên Mobile vì bị ẩn ở ngoài) */}
                <div className="p-3 border-b border-slate-100 sm:hidden">
                  <span className="block text-sm font-bold text-slate-700 truncate">
                    {isGuest ? "Chế độ Khách" : (user?.displayName || "Người dùng")}
                  </span>
                  <span className="block text-xs text-slate-500 truncate">
                    {isGuest ? "Dùng thử hệ thống" : user?.email}
                  </span>
                </div>
                
                {/* Thông tin Hệ thống */}
                <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                  <span className="block text-xs font-semibold text-slate-500 mb-0.5 uppercase tracking-wider">
                    Hệ thống
                  </span>
                  <span className="block text-sm font-medium text-slate-800 mb-2">
                    Quản lý Thẻ căn cước
                  </span>
                  <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                    Phiên bản {pkg.version}
                  </span>
                </div>

                <div className="p-1 border-b border-slate-100">
                  {onOpenSettings && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                    >
                      <Settings className="w-4 h-4" />
                      Cài đặt hệ thống
                    </button>
                  )}
                </div>

                <div className="p-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    {isGuest ? "Thoát chế độ Khách" : "Đăng xuất"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}