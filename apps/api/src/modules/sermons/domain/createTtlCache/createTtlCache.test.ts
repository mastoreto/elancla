import { describe, expect, test } from "bun:test";
import { createTtlCache } from "./createTtlCache";

describe("createTtlCache", () => {
  test("serves a value until it expires", () => {
    let clock = 1_000;
    const cache = createTtlCache<string>(600, () => clock);
    expect(cache.get("a")).toBeUndefined();
    cache.set("a", "one");
    clock += 599;
    expect(cache.get("a")).toBe("one");
    clock += 1;
    expect(cache.get("a")).toBeUndefined();
  });

  test("keys are independent and clear empties everything", () => {
    const cache = createTtlCache<number>(1_000);
    cache.set("a", 1);
    cache.set("b", 2);
    expect(cache.get("a")).toBe(1);
    expect(cache.get("b")).toBe(2);
    cache.clear();
    expect(cache.get("a")).toBeUndefined();
  });
});
