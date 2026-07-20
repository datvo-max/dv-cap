// src/shared/hooks/useSettings.ts
import { useState, useEffect } from "react";

export function useSettings() {
  const [unitName, setUnitName] = useState("Tân An");

  useEffect(() => {
    // Chỉ chạy ở client
    const savedName = localStorage.getItem("dv_cap_unit_name");
    if (savedName) {
      setUnitName(savedName);
    }

    // Lắng nghe sự kiện thay đổi từ tab khác hoặc từ SettingsModal
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "dv_cap_unit_name" && e.newValue) {
        setUnitName(e.newValue);
      }
    };

    const handleLocalChange = () => {
      const newName = localStorage.getItem("dv_cap_unit_name");
      if (newName) setUnitName(newName);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("dv_cap_settings_updated", handleLocalChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("dv_cap_settings_updated", handleLocalChange);
    };
  }, []);

  const updateUnitName = (newName: string) => {
    const trimmed = newName.trim() || "Tân An";
    localStorage.setItem("dv_cap_unit_name", trimmed);
    setUnitName(trimmed);
    // Kích hoạt sự kiện để các component khác (như Header) update ngay lập tức
    window.dispatchEvent(new Event("dv_cap_settings_updated"));
  };

  return { unitName, updateUnitName };
}
