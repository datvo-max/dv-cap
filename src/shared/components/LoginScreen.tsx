"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";
import { Loader2, User as UserIcon } from "lucide-react";

export default function LoginScreen() {
  const { loading, login, continueAsGuest } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Chưa đăng nhập
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-[500px] w-full rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-blue-600 p-8 text-center text-white">
          <h1 className="text-3xl font-bold tracking-tight mb-2">QL-TCC</h1>
          <p className="text-blue-100">Hệ thống Quản lý Thẻ Căn cước địa phương</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-semibold text-slate-800 text-center mb-6">Đăng nhập hệ thống</h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            Hệ thống yêu cầu xác thực bằng tài khoản Google để sử dụng.
          </p>

          <div className="space-y-3">
            <button
              onClick={login}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-700 font-medium rounded-xl transition-all duration-200 shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Đăng nhập với Google
            </button>
            
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">Hoặc</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button
              onClick={continueAsGuest}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium rounded-xl transition-all duration-200"
            >
              <UserIcon className="w-5 h-5" />
              Dùng thử không cần đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
