import { describe, expect, test } from "bun:test";
import { copyYearBody } from "@ancla/contracts";
import type { CopyItem } from "../../types";
import {
  areAllSelected,
  buildCopyBody,
  countSelected,
  describeCopyOutcome,
  filterCopyItems,
  toggleAllFiltered,
  toggleSelected,
} from "./copySelection";

const WORSHIP = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const YOUTH = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ID_A = "11111111-1111-4111-8111-111111111111";
const ID_B = "22222222-2222-4222-8222-222222222222";
const ID_C = "33333333-3333-4333-8333-333333333333";

const items: CopyItem[] = [
  { id: ID_A, kind: "activity", title: "Ensayo", detail: "", ministryIds: [WORSHIP] },
  { id: ID_B, kind: "event", title: "Retiro", detail: "", ministryIds: [YOUTH] },
  { id: ID_C, kind: "event", title: "Concierto", detail: "", ministryIds: [WORSHIP, YOUTH] },
];

describe("filterCopyItems", () => {
  test("without filters everything passes", () => {
    expect(filterCopyItems(items, { kind: "all", ministryId: "" })).toHaveLength(3);
  });

  test("filters by kind", () => {
    const ids = filterCopyItems(items, { kind: "event", ministryId: "" }).map((item) => item.id);
    expect(ids).toEqual([ID_B, ID_C]);
  });

  test("filters by ministry, also when the item has several", () => {
    const ids = filterCopyItems(items, { kind: "all", ministryId: WORSHIP }).map((item) => item.id);
    expect(ids).toEqual([ID_A, ID_C]);
  });

  test("combines both filters", () => {
    const ids = filterCopyItems(items, { kind: "event", ministryId: WORSHIP }).map(
      (item) => item.id,
    );
    expect(ids).toEqual([ID_C]);
  });
});

describe("selection", () => {
  test("toggles one item", () => {
    expect(toggleSelected([ID_A], ID_B)).toEqual([ID_A, ID_B]);
    expect(toggleSelected([ID_A, ID_B], ID_A)).toEqual([ID_B]);
  });

  test("selects every filtered item keeping what was already selected", () => {
    const events = items.filter((item) => item.kind === "event");
    expect(toggleAllFiltered([ID_A, ID_B], events)).toEqual([ID_A, ID_B, ID_C]);
  });

  test("unselects only the filtered items when they were all selected", () => {
    const events = items.filter((item) => item.kind === "event");
    expect(toggleAllFiltered([ID_A, ID_B, ID_C], events)).toEqual([ID_A]);
  });

  test("an empty list is never all selected", () => {
    expect(areAllSelected([ID_A], [])).toBe(false);
    expect(toggleAllFiltered([ID_A], [])).toEqual([ID_A]);
  });

  test("counts the selected items that are still listed", () => {
    expect(countSelected(items, [ID_A, "gone"])).toBe(1);
  });
});

describe("buildCopyBody", () => {
  test("splits the selection by kind into the ids the API copies", () => {
    const body = buildCopyBody({
      items,
      selectedIds: [ID_A, ID_C],
      fromYear: 2026,
      keepExactDates: true,
    });
    expect(body).toEqual({
      fromYear: 2026,
      activityIds: [ID_A],
      eventIds: [ID_C],
      keepExactDates: true,
    });
    expect(copyYearBody.safeParse(body).success).toBe(true);
  });

  test("leaves out selected ids that are not listed any more", () => {
    const body = buildCopyBody({
      items,
      selectedIds: ["gone", ID_B],
      fromYear: 2026,
      keepExactDates: false,
    });
    expect(body.activityIds).toEqual([]);
    expect(body.eventIds).toEqual([ID_B]);
  });

  test("an empty selection is rejected by the contract, which the form checks first", () => {
    const body = buildCopyBody({ items, selectedIds: [], fromYear: 2026, keepExactDates: false });
    expect(copyYearBody.safeParse(body).success).toBe(false);
  });
});

describe("describeCopyOutcome", () => {
  test("tells what was copied and that it is marked for review", () => {
    expect(describeCopyOutcome({ activities: 3, events: 2 })).toBe(
      "Se copiaron 3 actividades y 2 eventos; quedan marcados «a revisar».",
    );
  });

  test("uses the singular", () => {
    expect(describeCopyOutcome({ activities: 1, events: 1 })).toContain("1 actividad y 1 evento;");
  });
});
