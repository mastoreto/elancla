import { describe, expect, test } from "bun:test";
import { getMinistryDetail } from "./ministry-detail";

describe("getMinistryDetail", () => {
  test("merges the seed overrides into the summary", () => {
    const detail = getMinistryDetail("jovenes");
    expect(detail?.coLeaderName).toBe("Mariana Paz");
    expect(detail?.movements).toHaveLength(3);
  });

  test("falls back to defaults for ministries without extra detail", () => {
    const detail = getMinistryDetail("adoracion");
    expect(detail?.schedule).toBe("A definir");
    expect(detail?.about).toBe(detail?.description);
  });

  test("returns undefined for an unknown id", () => {
    expect(getMinistryDetail("nope")).toBeUndefined();
  });
});
