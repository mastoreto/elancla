import type { CopyYearBody } from "@ancla/contracts";
import type { CopyFilters, CopyItem, CopyOutcome } from "../../types";

/** The items the filters let through: by kind and by ministry. */
export function filterCopyItems(
  items: readonly CopyItem[],
  { kind, ministryId }: CopyFilters,
): CopyItem[] {
  return items.filter(
    (item) =>
      (kind === "all" || item.kind === kind) &&
      (ministryId === "" || item.ministryIds.includes(ministryId)),
  );
}

/** Ticks or unticks one item. */
export function toggleSelected(selectedIds: readonly string[], id: string): string[] {
  return selectedIds.includes(id)
    ? selectedIds.filter((selectedId) => selectedId !== id)
    : [...selectedIds, id];
}

/** Whether every one of the (filtered) items is selected; an empty list is not "all selected". */
export function areAllSelected(
  selectedIds: readonly string[],
  items: readonly CopyItem[],
): boolean {
  return items.length > 0 && items.every((item) => selectedIds.includes(item.id));
}

/** Selects every filtered item, or unselects them all when they already were; the rest is kept. */
export function toggleAllFiltered(
  selectedIds: readonly string[],
  filtered: readonly CopyItem[],
): string[] {
  const filteredIds = new Set(filtered.map((item) => item.id));
  if (areAllSelected(selectedIds, filtered)) {
    return selectedIds.filter((id) => !filteredIds.has(id));
  }
  return [
    ...selectedIds,
    ...filtered.map((item) => item.id).filter((id) => !selectedIds.includes(id)),
  ];
}

interface BuildCopyBodyInput {
  items: readonly CopyItem[];
  selectedIds: readonly string[];
  fromYear: number;
  keepExactDates: boolean;
}

/**
 * Translates the selection of the wizard into the ids the API copies. Only selected items that
 * are still listed go, split by kind; the server rejects any id that is not from `fromYear`.
 */
export function buildCopyBody({
  items,
  selectedIds,
  fromYear,
  keepExactDates,
}: BuildCopyBodyInput): CopyYearBody {
  const selected = items.filter((item) => selectedIds.includes(item.id));
  const idsOf = (kind: CopyItem["kind"]): string[] =>
    selected.filter((item) => item.kind === kind).map((item) => item.id);
  return {
    fromYear,
    activityIds: idsOf("activity"),
    eventIds: idsOf("event"),
    keepExactDates,
  };
}

/** The same selection ignoring the filters: what "Copiar" really sends. */
export function countSelected(items: readonly CopyItem[], selectedIds: readonly string[]): number {
  return items.filter((item) => selectedIds.includes(item.id)).length;
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** The message after copying: what was copied and that it all waits for a review. */
export function describeCopyOutcome({ activities, events }: CopyOutcome): string {
  const copied = `${plural(activities, "actividad", "actividades")} y ${plural(events, "evento", "eventos")}`;
  return `Se copiaron ${copied}; quedan marcados «a revisar».`;
}
