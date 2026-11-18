import { describe, expect, test } from "bun:test";
import type { Movement } from "@/lib/types";
import { filterMovements, formatMovementAmount } from "./movement-list";

const base = { description: "", reconciliation: "pending" } as const;
const movements: Movement[] = [
  {
    ...base,
    id: "1",
    date: "2026-03-20",
    concept: "Diezmos",
    type: "income",
    currency: "UYU",
    amount: 100,
  },
  {
    ...base,
    id: "2",
    date: "2026-03-22",
    concept: "Luz",
    type: "expense",
    currency: "USD",
    amount: 5,
    project: "Misiones",
  },
];

describe("filterMovements", () => {
  test("sorts newest first", () => {
    const ids = filterMovements(movements, { searchQuery: "", currency: "all" }).map((m) => m.id);
    expect(ids).toEqual(["2", "1"]);
  });

  test("filters by currency and by concept or project text", () => {
    expect(filterMovements(movements, { searchQuery: "", currency: "USD" })).toHaveLength(1);
    expect(filterMovements(movements, { searchQuery: "misiones", currency: "all" })).toHaveLength(
      1,
    );
  });
});

describe("formatMovementAmount", () => {
  test("prefixes income with + and expenses with a minus sign", () => {
    expect(formatMovementAmount(movements[0])).toBe("+ $U 100");
    expect(formatMovementAmount(movements[1])).toBe("− USD 5");
  });
});
