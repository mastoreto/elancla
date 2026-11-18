import { describe, expect, test } from "bun:test";
import type { Voucher } from "../../types";
import { filterVouchers, getInitials, getUniqueResponsibles } from "./voucher-list";

const vouchers: Voucher[] = [
  {
    id: "1",
    description: "Taxi",
    amount: 1,
    currency: "UYU",
    date: new Date("2026-03-02T00:00:00"),
    responsible: "Ana Martínez",
    relatedEntity: "x",
  },
  {
    id: "2",
    description: "Pan",
    amount: 1,
    currency: "UYU",
    date: new Date("2026-03-08T00:00:00"),
    responsible: "María González",
    relatedEntity: "y",
  },
];

describe("filterVouchers", () => {
  test("sorts newest first and filters by responsible and text", () => {
    expect(
      filterVouchers(vouchers, { searchQuery: "", responsible: "all" }).map((v) => v.id),
    ).toEqual(["2", "1"]);
    expect(filterVouchers(vouchers, { searchQuery: "", responsible: "Ana Martínez" })).toHaveLength(
      1,
    );
    expect(filterVouchers(vouchers, { searchQuery: "pan", responsible: "all" })).toHaveLength(1);
  });
});

test("getUniqueResponsibles lists each person once", () => {
  expect(getUniqueResponsibles([...vouchers, ...vouchers])).toEqual([
    "Ana Martínez",
    "María González",
  ]);
});

test("getInitials takes the first two words", () => {
  expect(getInitials("María González")).toBe("MG");
});
