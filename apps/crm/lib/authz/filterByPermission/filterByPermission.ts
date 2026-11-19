import type { Permission } from "@ancla/contracts";
import { type AccessSnapshot, canAny } from "../can";

/** Keeps the items whose `requires` the user holds (any one of them); no `requires` = always. */
export function filterByPermission<Item extends { requires?: readonly Permission[] }>(
  items: readonly Item[],
  access: AccessSnapshot,
): Item[] {
  return items.filter((item) => canAny(access, item.requires ?? []));
}
