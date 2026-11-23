import { describe, expect, test } from "bun:test";
import { summarizeSeries } from "./summarizeSeries";

const A = "0190a1b2-c3d4-7e5f-8a6b-7c8d9e0f1a2b";
const B = "0190a1b2-c3d4-7e5f-8a6b-7c8d9e0f1a2c";

describe("summarizeSeries", () => {
  test("counts the sermons of each series and finds its first and last date", () => {
    const summaries = summarizeSeries([
      { seriesId: A, preachedOn: "2026-03-08" },
      { seriesId: A, preachedOn: "2026-03-01" },
      { seriesId: A, preachedOn: "2026-03-15" },
      { seriesId: B, preachedOn: "2025-12-31" },
    ]);
    expect(summaries.get(A)).toEqual({
      sermonCount: 3,
      firstPreachedOn: "2026-03-01",
      lastPreachedOn: "2026-03-15",
    });
    expect(summaries.get(B)).toEqual({
      sermonCount: 1,
      firstPreachedOn: "2025-12-31",
      lastPreachedOn: "2025-12-31",
    });
  });

  test("ignores sermons outside a series, and a series without sermons has no entry", () => {
    const summaries = summarizeSeries([{ preachedOn: "2026-03-01" }]);
    expect(summaries.size).toBe(0);
  });
});
