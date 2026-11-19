"use client";

import { Download, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { Can } from "@/lib/authz/Gate";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { InventoryFilters, InventoryItem, InventoryViewMode } from "../types";
import { DEFAULT_INVENTORY_FILTERS, filterInventory } from "../utils";
import { InventoryCards } from "./inventory-cards";
import { InventorySummary } from "./inventory-summary";
import { InventoryTable } from "./inventory-table";
import { InventoryToolbar } from "./inventory-toolbar";

interface InventoryPageContentProps {
  items: readonly InventoryItem[];
}

const inventoryPageContentInventoryPage = {
  page: cn("flex flex-col gap-5"),
  header: cn("flex flex-wrap items-center gap-4"),
  description: cn("min-w-60 flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  actions: cn("ml-auto flex gap-2.5"),
  actionIcon: cn("size-4"),
};

export function InventoryPageContent({ items }: InventoryPageContentProps) {
  const [viewMode, setViewMode] = useState<InventoryViewMode>("table");
  const [filters, setFilters] = useState<InventoryFilters>(DEFAULT_INVENTORY_FILTERS);
  const filteredItems = useMemo(() => filterInventory(items, filters), [items, filters]);

  return (
    <div className={inventoryPageContentInventoryPage.page}>
      <div className={inventoryPageContentInventoryPage.header}>
        <p className={inventoryPageContentInventoryPage.description}>
          Todo lo que la iglesia tiene: dónde está, en qué estado y quién responde por cada ítem.
        </p>
        <div className={inventoryPageContentInventoryPage.actions}>
          <BoardButton size="md" variant="outline">
            <Download aria-hidden="true" className={inventoryPageContentInventoryPage.actionIcon} />
            Exportar
          </BoardButton>
          <Can permission="movements:create">
            <BoardButton href={getChurchRoutePath("inventory", "new")} size="md" variant="primary">
              <Plus aria-hidden="true" className={inventoryPageContentInventoryPage.actionIcon} />
              Nuevo ítem
            </BoardButton>
          </Can>
        </div>
      </div>

      <InventorySummary items={items} />

      <InventoryToolbar
        filters={filters}
        onFiltersChange={setFilters}
        onViewModeChange={setViewMode}
        viewMode={viewMode}
      />

      {viewMode === "table" ? (
        <InventoryTable items={filteredItems} />
      ) : (
        <InventoryCards items={filteredItems} />
      )}
    </div>
  );
}
