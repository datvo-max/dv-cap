"use client";

import React, { useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { CURRENT_VERSION } from "../lib/currentVersion";

// Kiểm tra 1-2 lần mỗi ngày (12 tiếng = 43,200,000 ms)
const CHECK_INTERVAL_MS = 12 * 60 * 60 * 1000;
const STORAGE_KEY = "ql_tcc_last_version_check";

export default function VersionChecker() {
  const isCheckingRef = useRef(false);

  const checkVersion = useCallback(async (force = false) => {
    if (isCheckingRef.current) return;

    try {
      const lastCheck = Number(localStorage.getItem(STORAGE_KEY) || 0);
      const now = Date.now();

      // Nếu không phải force và chưa đủ 12 giờ kể từ lần check thành công gần nhất thì bỏ qua
      if (!force && now - lastCheck < CHECK_INTERVAL_MS) {
        return;
      }

      isCheckingRef.current = true;

      // Thử fetch relative path trước (hỗ trợ cả GitHub Pages có subdirectory), nếu lỗi fallback về root
      let res = await fetch(`version.json?t=${now}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!res.ok) {
        res = await fetch(`/version.json?t=${now}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
      }

      if (!res.ok) {
        isCheckingRef.current = false;
        return;
      }

      const serverInfo: { version: string; buildTime: number } = await res.json();
      localStorage.setItem(STORAGE_KEY, now.toString());

      // Đối chiếu mốc thời gian build (buildTime) trên máy chủ với client
      if (serverInfo.buildTime && serverInfo.buildTime > CURRENT_VERSION.buildTime) {
        // Kiểm tra xem người dùng có đang nhập liệu hoặc đang mở Modal không
        const activeEl = document.activeElement;
        const isInputActive = activeEl && (
          activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          activeEl.getAttribute("contenteditable") === "true"
        );
        
        // Kiểm tra có modal nào đang mở không (tìm theo role="dialog" hoặc lớp overlay z-50 thông dụng)
        const isModalOpen = !!document.querySelector('[role="dialog"]') || !!document.querySelector('.fixed.inset-0.z-50');

        if (isInputActive || isModalOpen) {
          // Hiển thị Toast cố định cho phép người dùng tự bấm cập nhật khi nhập liệu xong
          toast((t) => (
            <div className="flex items-center justify-between gap-4 min-w-[280px]">
              <div className="text-sm">
                <p className="font-bold text-gray-800">💡 Có bản cập nhật mới ({serverInfo.version})</p>
                <p className="text-xs text-gray-600">Bạn đang nhập liệu, hãy cập nhật khi hoàn tất thao tác.</p>
              </div>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  window.location.reload();
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition-colors shrink-0"
              >
                Cập nhật ngay
              </button>
            </div>
          ), { duration: Infinity, id: "version-update-toast", position: "top-center" });
        } else {
          // Người dùng đang rảnh tay -> Tự động làm mới trang sau 1.5s
          toast.success(`🚀 Phát hiện phiên bản mới (${serverInfo.version})! Đang tự động làm mới...`, {
            duration: 2000,
            id: "version-update-toast",
          });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      }
    } catch (error) {
      // Bỏ qua lỗi kết nối (ví dụ offline hoặc mất mạng tạm thời)
    } finally {
      isCheckingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Check lần đầu khi ứng dụng mount (nếu đã quá 12h kể từ lần trước)
    const timer = setTimeout(() => {
      checkVersion(false);
    }, 3000); // Đợi 3 giây để giao diện khởi tạo mượt mà trước khi check

    // Lên lịch định kỳ mỗi 12 giờ check 1 lần
    const interval = setInterval(() => {
      checkVersion(false);
    }, CHECK_INTERVAL_MS);

    // Lắng nghe sự kiện người dùng chuyển lại tab (khi máy tắt màn hình bật lại hoặc chuyển tab sau 1 thời gian dài)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkVersion(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", () => checkVersion(false));

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", () => checkVersion(false));
    };
  }, [checkVersion]);

  return null;
}
