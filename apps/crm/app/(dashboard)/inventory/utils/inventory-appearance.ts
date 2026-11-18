import { Armchair, CookingPot, Mic, Music, Projector, TriangleAlert } from "lucide-react";
import type { IconBubbleTone } from "@/components/dashboard/board/icon-bubble";
import type { StatusPillTone } from "@/components/dashboard/board/status-pill";
import type { InventoryCategory, InventoryItem, InventoryStatus } from "../types";

export const INVENTORY_CATEGORIES: readonly InventoryCategory[] = [
  "Sonido",
  "Instrumentos",
  "Mobiliario",
  "Tecnología",
  "Cocina",
];

export const INVENTORY_STATUS_TONE = {
  Bueno: "green",
  Regular: "gold",
  Prestado: "ink",
  "En reparación": "rose",
  "Dado de baja": "ink",
} satisfies Record<InventoryStatus, StatusPillTone>;

const CATEGORY_ICON = {
  Sonido: Mic,
  Instrumentos: Music,
  Mobiliario: Armchair,
  Tecnología: Projector,
  Cocina: CookingPot,
} satisfies Record<InventoryCategory, typeof Mic>;

/** Retired items get a neutral bubble and a warning glyph, as the board shows. */
export function getInventoryAppearance(item: Pick<InventoryItem, "category" | "status">): {
  icon: typeof Mic;
  tone: IconBubbleTone;
} {
  if (item.status === "Dado de baja") {
    return { icon: TriangleAlert, tone: "ink" };
  }
  return { icon: CATEGORY_ICON[item.category], tone: "rose" };
}
