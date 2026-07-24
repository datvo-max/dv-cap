// src/shared/hooks/useSettings.ts
import { useState, useEffect } from "react";

export function useSettings() {
  const [unitName, setUnitName] = useState("Tân An");
  const [cardsPerBox, setCardsPerBox] = useState(50);

  useEffect(() => {
    // Chỉ chạy ở client
    const savedName = localStorage.getItem("dv_cap_unit_name");
    if (savedName) {
      setUnitName(savedName);
    }
    const savedCards = localStorage.getItem("dv_cap_cards_per_box");
    if (savedCards && !isNaN(Number(savedCards))) {
      setCardsPerBox(Number(savedCards));
    }

    // Lắng nghe sự kiện thay đổi từ tab khác hoặc từ SettingsModal
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "dv_cap_unit_name" && e.newValue) {
        setUnitName(e.newValue);
      }
      if (e.key === "dv_cap_cards_per_box" && e.newValue && !isNaN(Number(e.newValue))) {
        setCardsPerBox(Number(e.newValue));
      }
    };

    const handleLocalChange = () => {
      const newName = localStorage.getItem("dv_cap_unit_name");
      if (newName) setUnitName(newName);
      const newCards = localStorage.getItem("dv_cap_cards_per_box");
      if (newCards && !isNaN(Number(newCards))) setCardsPerBox(Number(newCards));
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
    window.dispatchEvent(new Event("dv_cap_settings_updated"));
  };

  const updateCardsPerBox = (newCount: number) => {
    const count = Math.max(1, newCount);
    localStorage.setItem("dv_cap_cards_per_box", count.toString());
    setCardsPerBox(count);
    window.dispatchEvent(new Event("dv_cap_settings_updated"));
  };

  return { unitName, updateUnitName, cardsPerBox, updateCardsPerBox };
}
