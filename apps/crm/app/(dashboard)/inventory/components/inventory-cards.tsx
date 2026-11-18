import { MapPin } from "lucide-react";
import Link from "next/link";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { InventoryItem } from "../types";
import { getInventoryAppearance } from "../utils";
import { InventoryStatusBadge } from "./inventory-status-badge";

interface InventoryCardsProps {
  items: readonly InventoryItem[];
}

const inventoryCardsInventoryPage = {
  grid: cn("grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"),
  card: cn("relative p-[18px]"),
  thumb: cn(
    "mb-3.5 flex h-[120px] items-center justify-center rounded-[20px] bg-secondary",
    "bg-[repeating-linear-gradient(135deg,rgba(42,21,26,0.035)_0_1px,transparent_1px_9px)]",
  ),
  bubble: cn("size-14"),
  bubbleIcon: cn("size-6"),
  header: cn("flex items-start gap-2"),
  heading: cn("flex flex-1 flex-col gap-0.5"),
  title: cn("font-display text-lg leading-tight font-medium after:absolute after:inset-0"),
  meta: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  footer: cn("mt-3.5 flex items-center gap-2 text-[12.5px] text-[var(--tinta-suave)]"),
  location: cn("flex-1"),
  quantity: cn("tabular-nums"),
  pinIcon: cn("size-4"),
  empty: cn("py-10 text-center text-sm text-[var(--tinta-apagada)]"),
};

export function InventoryCards({ items }: InventoryCardsProps) {
  if (items.length === 0) {
    return <p className={inventoryCardsInventoryPage.empty}>No hay ítems encontrados.</p>;
  }

  return (
    <div className={inventoryCardsInventoryPage.grid}>
      {items.map((item) => {
        const { icon: Icon, tone } = getInventoryAppearance(item);
        return (
          <BoardCard className={inventoryCardsInventoryPage.card} key={item.id}>
            <div className={inventoryCardsInventoryPage.thumb}>
              <IconBubble className={inventoryCardsInventoryPage.bubble} tone={tone}>
                <Icon aria-hidden="true" className={inventoryCardsInventoryPage.bubbleIcon} />
              </IconBubble>
            </div>
            <div className={inventoryCardsInventoryPage.header}>
              <div className={inventoryCardsInventoryPage.heading}>
                <Link
                  className={inventoryCardsInventoryPage.title}
                  href={getChurchRoutePath("inventory", item.id)}
                >
                  {item.name}
                </Link>
                <span className={inventoryCardsInventoryPage.meta}>
                  {item.code} · {item.category}
                </span>
              </div>
              <InventoryStatusBadge status={item.status} />
            </div>
            <div className={inventoryCardsInventoryPage.footer}>
              <MapPin aria-hidden="true" className={inventoryCardsInventoryPage.pinIcon} />
              <span className={inventoryCardsInventoryPage.location}>{item.location}</span>
              <b className={inventoryCardsInventoryPage.quantity}>× {item.quantity}</b>
            </div>
          </BoardCard>
        );
      })}
    </div>
  );
}
