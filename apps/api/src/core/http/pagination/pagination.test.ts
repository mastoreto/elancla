import { describe, expect, test } from "bun:test";
import { ValidationError } from "../../errors";
import { parsePageQuery, toPage } from "./pagination";

const CURSOR = "0190a5f0-7b3c-7c1a-8e3f-1a2b3c4d5e6f";

describe("parsePageQuery", () => {
  test("defaults to 25 items without cursor", () => {
    expect(parsePageQuery({})).toEqual({ limit: 25 });
  });

  test("accepts limit up to 100 and a UUID cursor", () => {
    expect(parsePageQuery({ limit: "100", cursor: CURSOR })).toEqual({
      limit: 100,
      cursor: CURSOR,
    });
  });

  test("rejects limit above the maximum, below 1 or not numeric", () => {
    for (const limit of ["101", "0", "-1", "abc"]) {
      expect(() => parsePageQuery({ limit })).toThrow(ValidationError);
    }
  });

  test("rejects an invalid cursor", () => {
    expect(() => parsePageQuery({ cursor: "not-a-cursor" })).toThrow(
      ValidationError,
    );
  });
});

describe("toPage", () => {
  const rows = (count: number): { id: string }[] =>
    Array.from({ length: count }, (_, index) => ({ id: `id-${index}` }));

  test("sets nextCursor to the last returned id when there is an extra row", () => {
    const page = toPage(rows(4), 3);
    expect(page.items).toHaveLength(3);
    expect(page.nextCursor).toBe("id-2");
  });

  test("has no cursor on the last page", () => {
    expect(toPage(rows(3), 3).nextCursor).toBeNull();
    expect(toPage([], 3)).toEqual({ items: [], nextCursor: null });
  });
});
