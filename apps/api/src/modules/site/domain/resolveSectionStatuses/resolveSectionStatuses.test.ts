import { describe, expect, test } from "bun:test";
import { resolveSectionStatuses } from "./resolveSectionStatuses";

const ALL_ACTIVE = {
  blog: "active",
  calendar: "active",
  sermons: "active",
  ministries: "active",
  visit: "active",
};

describe("resolveSectionStatuses", () => {
  test("an empty map completes every key as active", () => {
    expect(resolveSectionStatuses({})).toEqual(ALL_ACTIVE);
  });

  test("keeps the configured keys and completes the rest", () => {
    expect(
      resolveSectionStatuses({ blog: "maintenance", visit: "outOfService" }),
    ).toEqual({
      ...ALL_ACTIVE,
      blog: "maintenance",
      visit: "outOfService",
    });
  });

  test("drops unknown keys", () => {
    const resolved = resolveSectionStatuses({ gallery: "maintenance" });
    expect(resolved).toEqual(ALL_ACTIVE);
    expect(Object.keys(resolved)).not.toContain("gallery");
  });

  test("an unknown value falls back to active", () => {
    expect(resolveSectionStatuses({ blog: "broken", sermons: 3 })).toEqual(
      ALL_ACTIVE,
    );
  });

  test("anything that is not the expected shape is empty or all active", () => {
    for (const stored of [null, undefined, "text", 42, [], ["blog"]]) {
      expect(resolveSectionStatuses(stored)).toEqual(ALL_ACTIVE);
    }
  });
});
