import { describe, expect, test } from "bun:test";
import { nextSeriesOrder } from "./nextSeriesOrder";

const A = "0190a1b2-c3d4-7e5f-8a6b-7c8d9e0f1a2b";
const B = "0190a1b2-c3d4-7e5f-8a6b-7c8d9e0f1a2c";

describe("nextSeriesOrder", () => {
  test("starts at 1 in an empty series", () => {
    expect(nextSeriesOrder([], A)).toBe(1);
    expect(nextSeriesOrder([{ seriesId: B, seriesOrder: 7 }], A)).toBe(1);
  });

  test("takes the position after the highest one of that series", () => {
    expect(
      nextSeriesOrder(
        [
          { seriesId: A, seriesOrder: 1 },
          { seriesId: A, seriesOrder: 4 },
          { seriesId: B, seriesOrder: 9 },
          {},
        ],
        A,
      ),
    ).toBe(5);
  });

  test("never passes the contract maximum", () => {
    expect(nextSeriesOrder([{ seriesId: A, seriesOrder: 999 }], A)).toBe(999);
  });
});
