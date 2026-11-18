import { describe, expect, test } from "bun:test";
import { filterContent, paginate } from "./content-list-utils";

const items = [
  { id: 1, status: "published", group: "A", searchText: "Gracia Daniel" },
  { id: 2, status: "draft", group: "B", searchText: "Fe Ana" },
  { id: 3, status: "paused", group: "A", searchText: "Paz Luis" },
] as const;

describe("filterContent", () => {
  test("filters by status, group and text", () => {
    const base = { status: "all", search: "", group: "" } as const;
    expect(filterContent([...items], base)).toHaveLength(3);
    expect(filterContent([...items], { ...base, status: "draft" })).toHaveLength(1);
    expect(filterContent([...items], { ...base, group: "A" })).toHaveLength(2);
    expect(filterContent([...items], { ...base, search: "ana" })[0]?.id).toBe(2);
  });
});

describe("paginate", () => {
  test("clamps the page and slices", () => {
    const result = paginate([1, 2, 3, 4, 5], 9, 2);
    expect(result.page).toBe(3);
    expect(result.items).toEqual([5]);
    expect(paginate([], 1, 5).pageCount).toBe(1);
  });
});
