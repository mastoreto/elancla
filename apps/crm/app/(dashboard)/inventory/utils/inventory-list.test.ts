import { describe, expect, test } from "bun:test";
import { inventoryItems } from "../data/inventory-items";
import { filterInventory, parseInventoryValue, sumInventoryValues } from "./inventory-list";

describe("inventory list utils", () => {
  test("parses values in both currencies", () => {
    expect(parseInventoryValue("USD 1.450")).toEqual({ currency: "USD", amount: 1450 });
    expect(parseInventoryValue("$U 96.000")).toEqual({ currency: "UYU", amount: 96_000 });
  });

  test("sums values per currency", () => {
    expect(sumInventoryValues(inventoryItems).uyu).toBe(184_000);
  });

  test("filters by category and search text", () => {
    const sound = filterInventory(inventoryItems, { search: "", category: "Sonido" });
    expect(sound.every((item) => item.category === "Sonido")).toBe(true);
    const byCode = filterInventory(inventoryItems, { search: "inv-0004", category: "all" });
    expect(byCode.map((item) => item.name)).toEqual(["Piano digital Roland"]);
  });
});
