import { describe, expect, test } from "bun:test";
import type { CalendarYearDto } from "@ancla/contracts";
import { draftYearsOf, pickCopyYears } from "./copyYears";

function year(value: number, status: CalendarYearDto["status"]): CalendarYearDto {
  return { year: value, status, publishedAt: null, publishedById: null };
}

const years = [year(2025, "published"), year(2026, "published"), year(2027, "draft")];

describe("draftYearsOf", () => {
  test("keeps only the drafts", () => {
    expect(draftYearsOf(years).map((item) => item.year)).toEqual([2027]);
  });
});

describe("pickCopyYears", () => {
  test("copies from the latest year before the latest draft into that draft", () => {
    expect(pickCopyYears(years, { from: undefined, to: undefined })).toEqual({
      fromYear: 2026,
      toYear: 2027,
    });
  });

  test("honours the requested years when they are valid", () => {
    expect(pickCopyYears(years, { from: 2025, to: 2027 })).toEqual({
      fromYear: 2025,
      toYear: 2027,
    });
  });

  test("a requested destination that is not a draft is ignored", () => {
    expect(pickCopyYears(years, { from: undefined, to: 2026 }).toYear).toBe(2027);
  });

  test("a requested source equal to the destination or unknown is ignored", () => {
    expect(pickCopyYears(years, { from: 2027, to: 2027 }).fromYear).toBe(2026);
    expect(pickCopyYears(years, { from: 1999, to: 2027 }).fromYear).toBe(2026);
  });

  test("without drafts there is no destination but there is still a source", () => {
    expect(pickCopyYears([year(2026, "published")], { from: undefined, to: undefined })).toEqual({
      fromYear: 2026,
      toYear: null,
    });
  });

  test("without years there is nothing to pick", () => {
    expect(pickCopyYears([], { from: undefined, to: undefined })).toEqual({
      fromYear: null,
      toYear: null,
    });
  });

  test("a lone draft has no source", () => {
    expect(pickCopyYears([year(2027, "draft")], { from: undefined, to: undefined })).toEqual({
      fromYear: null,
      toYear: 2027,
    });
  });
});
