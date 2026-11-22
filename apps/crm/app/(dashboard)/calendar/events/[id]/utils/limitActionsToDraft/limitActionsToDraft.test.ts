import { describe, expect, test } from "bun:test";
import type { EditorialStatusDto } from "@ancla/contracts";
import { limitActionsToDraft } from "./limitActionsToDraft";

const status: EditorialStatusDto = {
  live: null,
  working: null,
  availableActions: ["saveDraft", "submit", "publish"],
};

describe("limitActionsToDraft", () => {
  test("a draft year leaves only saving the draft", () => {
    expect(limitActionsToDraft(status, true).availableActions).toEqual(["saveDraft"]);
  });

  test("a published year keeps every action the API gave", () => {
    expect(limitActionsToDraft(status, false)).toBe(status);
  });

  test("a draft year with no save action stays empty", () => {
    const limited = limitActionsToDraft({ ...status, availableActions: ["pause"] }, true);
    expect(limited.availableActions).toEqual([]);
  });
});
