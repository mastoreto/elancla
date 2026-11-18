import { describe, expect, test } from "bun:test";
import { countByStatus, formatRequestAmount, getInitials } from "./request-list";

describe("formatRequestAmount", () => {
  test("writes pesos with the $U prefix and a thousands dot", () => {
    expect(formatRequestAmount(4500, "UYU")).toBe("$U 4.500");
  });

  test("writes dollars with the USD prefix", () => {
    expect(formatRequestAmount(320, "USD")).toBe("USD 320");
  });
});

describe("getInitials", () => {
  test("takes the first letters of the first two words", () => {
    expect(getInitials("Carlos Rodríguez")).toBe("CR");
  });
});

describe("countByStatus", () => {
  test("counts every status and the total", () => {
    const counts = countByStatus([
      { status: "pending" },
      { status: "approved" },
      { status: "approved" },
    ] as Parameters<typeof countByStatus>[0]);
    expect(counts).toEqual({ all: 3, pending: 1, approved: 2, rejected: 0 });
  });
});
