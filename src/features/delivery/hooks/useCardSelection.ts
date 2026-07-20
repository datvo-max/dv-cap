import { useState, useCallback } from "react";
import { db, addCardHistoryBulk } from "@/shared/lib/db";

export function useCardSelection(
  showToast: (msg: string, type: "success" | "error" | "warning" | "info") => void
) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [assignShipperModalConfig, setAssignShipperModalConfig] = useState({ isOpen: false });
  const [moveCardsBoxModalConfig, setMoveCardsBoxModalConfig] = useState({ isOpen: false });

  const toggleSelectCard = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((displayedIds: number[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allDisplayedSelected = displayedIds.every(id => next.has(id));
      if (allDisplayedSelected) {
        displayedIds.forEach(id => next.delete(id));
      } else {
        displayedIds.forEach(id => next.add(id));
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // --- Chuyển hộp ---
  const openMoveCardsBoxModal = () => {
    if (selectedIds.size === 0) {
      showToast("⚠️ Vui lòng chọn ít nhất 1 thẻ để chuyển hộp!", "warning");
      return;
    }
    setMoveCardsBoxModalConfig({ isOpen: true });
  };

  const closeMoveCardsBoxModal = () => {
    setMoveCardsBoxModalConfig({ isOpen: false });
  };

  const executeMoveCardsBox = async (newZone: number | string) => {
    try {
      if (selectedIds.size === 0) return;
      const idsArray = Array.from(selectedIds);
      
      let count = 0;
      const historyEntries: { idNumber: string; action: string; details: string }[] = [];
      await db.transaction("rw", db.cards, async () => {
        for (const id of idsArray) {
          const card = await db.cards.get(id);
          if (card) {
            await db.cards.update(id, {
              zone: newZone
            });
            historyEntries.push({
              idNumber: card.idNumber,
              action: 'move_box',
              details: `Chuyển thẻ từ Hộp ${card.zone} sang Hộp ${newZone}`
            });
            count++;
          }
        }
      });

      if (historyEntries.length > 0) {
        await addCardHistoryBulk(historyEntries as any);
      }
      
      showToast(`✅ Đã chuyển thành công ${count} thẻ sang hộp ${newZone}!`, "success");
      clearSelection();
      closeMoveCardsBoxModal();
    } catch (error) {
      console.error(error);
      showToast("❌ Có lỗi xảy ra khi chuyển hộp!", "error");
    }
  };

  // --- Chuyển Shipper ---
  const openAssignShipperModal = () => {
    if (selectedIds.size === 0) {
      showToast("⚠️ Vui lòng chọn ít nhất 1 thẻ để bàn giao shipper!", "warning");
      return;
    }
    setAssignShipperModalConfig({ isOpen: true });
  };

  const closeAssignShipperModal = () => {
    setAssignShipperModalConfig({ isOpen: false });
  };

  const executeAssignShipper = async (name: string, phone: string) => {
    try {
      if (selectedIds.size === 0) return;
      const idsArray = Array.from(selectedIds);
      
      let count = 0;
      const historyEntries: { idNumber: string; action: string; details: string }[] = [];
      await db.transaction("rw", db.cards, async () => {
        for (const id of idsArray) {
          const card = await db.cards.get(id);
          if (card && card.status !== 'returned') {
            await db.cards.update(id, {
              status: 'shipping',
              shipperName: name,
              shipperPhone: phone,
              shippedAt: Date.now()
            });
            historyEntries.push({
              idNumber: card.idNumber,
              action: 'assign_shipper',
              details: `Bàn giao cho shipper: ${name} (${phone})`
            });
            count++;
          }
        }
      });

      if (historyEntries.length > 0) {
        await addCardHistoryBulk(historyEntries as any);
      }
      
      showToast(`✅ Đã bàn giao thành công ${count} thẻ cho shipper ${name}!`, "success");
      clearSelection();
      closeAssignShipperModal();
    } catch (error) {
      console.error(error);
      showToast("❌ Có lỗi xảy ra khi bàn giao cho shipper!", "error");
    }
  };

  // --- Xác nhận giao hàng loạt ---
  const executeBulkConfirmDelivered = async () => {
    try {
      if (selectedIds.size === 0) return;
      const idsArray = Array.from(selectedIds);
      
      let count = 0;
      const historyEntries: { idNumber: string; action: string; details: string }[] = [];
      await db.transaction("rw", db.cards, async () => {
        for (const id of idsArray) {
          const card = await db.cards.get(id);
          if (card && card.status === 'shipping') {
            await db.cards.update(id, {
              status: 'returned',
              returnedAt: Date.now()
            });
            historyEntries.push({
              idNumber: card.idNumber,
              action: 'bulk_confirm_delivered',
              details: `Shipper giao thành công cho công dân`
            });
            count++;
          }
        }
      });

      if (historyEntries.length > 0) {
        await addCardHistoryBulk(historyEntries as any);
      }
      
      showToast(`✅ Đã xác nhận shipper giao thành công ${count} thẻ!`, "success");
      clearSelection();
    } catch (error) {
      console.error(error);
      showToast("❌ Có lỗi xảy ra khi xác nhận giao hàng hàng loạt!", "error");
    }
  };

  // --- Hoàn tác về kho hàng loạt ---
  const executeBulkReturnToWarehouse = async () => {
    try {
      if (selectedIds.size === 0) return;
      const idsArray = Array.from(selectedIds);
      
      let count = 0;
      const historyEntries: { idNumber: string; action: string; details: string }[] = [];
      await db.transaction("rw", db.cards, async () => {
        for (const id of idsArray) {
          const card = await db.cards.get(id);
          if (card && (card.status === 'shipping' || card.status === 'returned')) {
            await db.cards.update(id, {
              status: 'pending',
              returnedAt: undefined,
              shipperName: undefined,
              shipperPhone: undefined,
              shippedAt: undefined
            });
            historyEntries.push({
              idNumber: card.idNumber,
              action: 'bulk_return_to_warehouse',
              details: `Hoàn tác về kho hàng loạt (đưa về Hộp ${card.zone})`
            });
            count++;
          }
        }
      });

      if (historyEntries.length > 0) {
        await addCardHistoryBulk(historyEntries as any);
      }
      
      showToast(`🔄 Đã hoàn tác ${count} thẻ về lại kho!`, "info");
      clearSelection();
    } catch (error) {
      console.error(error);
      showToast("❌ Có lỗi xảy ra khi hoàn tác hàng loạt!", "error");
    }
  };

  return {
    selectedIds,
    isSelectMode,
    setIsSelectMode,
    toggleSelectCard,
    toggleSelectAll,
    clearSelection,
    
    moveCardsBoxModalConfig,
    openMoveCardsBoxModal,
    closeMoveCardsBoxModal,
    executeMoveCardsBox,

    assignShipperModalConfig,
    openAssignShipperModal,
    closeAssignShipperModal,
    executeAssignShipper,

    executeBulkConfirmDelivered,
    executeBulkReturnToWarehouse,
  };
}
