"use client";

import { Check, ChevronDown, PencilLine, RefreshCw } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { INVENTORY_STATUSES } from "../schema";
import type { InventoryItemDetail, InventoryStatus } from "../types";
import { getInventoryAppearance } from "../utils";
import { InventoryStatusBadge } from "./inventory-status-badge";

interface InventoryDetailHeroProps {
  item: InventoryItemDetail;
  status: InventoryStatus;
  onStatusChange: (status: InventoryStatus) => void;
}

const inventoryDetailHeroInventoryPage = {
  card: cn("flex flex-wrap items-center gap-[22px] p-6"),
  thumb: cn(
    "flex h-[140px] w-[180px] shrink-0 items-center justify-center rounded-3xl bg-secondary",
    "bg-[repeating-linear-gradient(135deg,rgba(42,21,26,0.035)_0_1px,transparent_1px_9px)]",
  ),
  bubble: cn("size-16"),
  bubbleIcon: cn("size-7"),
  body: cn("flex min-w-60 flex-1 flex-col gap-2"),
  meta: cn("flex items-center gap-2 text-[13px] text-[var(--tinta-apagada)]"),
  title: cn("font-display text-[32px] leading-[1.1] font-semibold tracking-tight"),
  place: cn("text-sm text-[var(--tinta-suave)]"),
  actions: cn("flex w-full flex-col gap-2.5 sm:w-[190px]"),
  action: cn("w-full"),
  icon: cn("size-4"),
  check: cn("ml-auto size-4"),
  menuItem: cn("min-w-48 gap-2"),
};

export function InventoryDetailHero({ item, status, onStatusChange }: InventoryDetailHeroProps) {
  const { icon: Icon, tone } = getInventoryAppearance({ category: item.category, status });

  return (
    <BoardCard className={inventoryDetailHeroInventoryPage.card}>
      <div className={inventoryDetailHeroInventoryPage.thumb}>
        <IconBubble className={inventoryDetailHeroInventoryPage.bubble} tone={tone}>
          <Icon aria-hidden="true" className={inventoryDetailHeroInventoryPage.bubbleIcon} />
        </IconBubble>
      </div>
      <div className={inventoryDetailHeroInventoryPage.body}>
        <div className={inventoryDetailHeroInventoryPage.meta}>
          <InventoryStatusBadge status={status} />
          <span>
            {item.code} · {item.category}
          </span>
        </div>
        <h1 className={inventoryDetailHeroInventoryPage.title}>{item.name}</h1>
        <p className={inventoryDetailHeroInventoryPage.place}>
          {item.location} · a cargo de {item.responsible}
        </p>
      </div>
      <div className={inventoryDetailHeroInventoryPage.actions}>
        <BoardButton
          className={inventoryDetailHeroInventoryPage.action}
          href={getChurchRoutePath("inventory", item.id, "edit")}
          variant="outline"
        >
          <PencilLine aria-hidden="true" className={inventoryDetailHeroInventoryPage.icon} />
          Editar
        </BoardButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild={true}>
            <BoardButton className={inventoryDetailHeroInventoryPage.action} variant="primary">
              <RefreshCw aria-hidden="true" className={inventoryDetailHeroInventoryPage.icon} />
              Cambiar estado
              <ChevronDown aria-hidden="true" className={inventoryDetailHeroInventoryPage.icon} />
            </BoardButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {INVENTORY_STATUSES.map((option) => (
              <DropdownMenuItem
                className={inventoryDetailHeroInventoryPage.menuItem}
                key={option}
                onSelect={() => onStatusChange(option)}
              >
                {option}
                {option === status ? (
                  <Check aria-hidden="true" className={inventoryDetailHeroInventoryPage.check} />
                ) : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </BoardCard>
  );
}
