import { describe, expect, test } from "bun:test";
import type { EditorialActionDto } from "@ancla/contracts";
import type { EditorialState } from "@ancla/db";
import { nextState } from "./editorialMachine";

const STATES: (EditorialState | null)[] = [
  null,
  "DRAFT",
  "IN_REVIEW",
  "CHANGES_REQUESTED",
  "PUBLISHED",
  "PAUSED",
  "SUPERSEDED",
];

const VALID: Record<
  EditorialActionDto,
  [EditorialState | null, EditorialState][]
> = {
  saveDraft: [
    [null, "DRAFT"],
    ["DRAFT", "DRAFT"],
    ["CHANGES_REQUESTED", "DRAFT"],
  ],
  submit: [["DRAFT", "IN_REVIEW"]],
  publish: [["DRAFT", "PUBLISHED"]],
  approve: [["IN_REVIEW", "PUBLISHED"]],
  requestChanges: [["IN_REVIEW", "CHANGES_REQUESTED"]],
  pause: [["PUBLISHED", "PAUSED"]],
  resume: [["PAUSED", "PUBLISHED"]],
};

describe("editorial state machine", () => {
  for (const [action, valid] of Object.entries(VALID) as [
    EditorialActionDto,
    [EditorialState | null, EditorialState][],
  ][]) {
    test(`${action}: every state gives the table's result or null`, () => {
      for (const state of STATES) {
        const expected = valid.find(([from]) => from === state)?.[1] ?? null;
        expect({ action, state, next: nextState(state, action) }).toEqual({
          action,
          state,
          next: expected,
        });
      }
    });
  }

  test("a superseded revision accepts no action", () => {
    for (const action of Object.keys(VALID) as EditorialActionDto[]) {
      expect(nextState("SUPERSEDED", action)).toBeNull();
    }
  });
});
