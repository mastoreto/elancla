import { describe, expect, it } from "bun:test";
import { getInventoryDetail, toInventoryFormValues } from "./inventory-detail";

describe("getInventoryDetail", () => {
  it("returns null for unknown ids", () => {
    expect(getInventoryDetail("nope")).toBeNull();
  });

  it("merges seed overrides over defaults", () => {
    expect(getInventoryDetail("1")?.brand).toBe("Yamaha");
  });

  it("falls back to defaults when there is no seed detail", () => {
    const detail = getInventoryDetail("2");
    expect(detail?.responsible).toBe("Sin asignar");
    expect(detail?.history).toEqual([]);
  });
});

describe("toInventoryFormValues", () => {
  it("keeps only digits of the value", () => {
    const detail = getInventoryDetail("1");
    expect(detail && toInventoryFormValues(detail).value).toBe("1450");
  });
});
