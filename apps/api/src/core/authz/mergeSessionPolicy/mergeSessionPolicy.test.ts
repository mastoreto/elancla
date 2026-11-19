import { describe, expect, test } from "bun:test";
import { mergeSessionPolicy } from "./mergeSessionPolicy";

describe("mergeSessionPolicy", () => {
  test("no roles means the default policy", () => {
    expect(mergeSessionPolicy([])).toEqual({
      persistent: true,
      maxSessionSeconds: null,
    });
  });

  test("one non-persistent role makes the session non-persistent", () => {
    const policy = mergeSessionPolicy([
      { persistentSession: true, maxSessionSeconds: null },
      { persistentSession: false, maxSessionSeconds: null },
    ]);
    expect(policy.persistent).toBe(false);
  });

  test("the shortest maximum wins and null does not count", () => {
    const policy = mergeSessionPolicy([
      { persistentSession: true, maxSessionSeconds: 3600 },
      { persistentSession: true, maxSessionSeconds: 600 },
      { persistentSession: true, maxSessionSeconds: null },
    ]);
    expect(policy.maxSessionSeconds).toBe(600);
  });
});
