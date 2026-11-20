import { describe, expect, test } from "bun:test";
import {
  type AvailableActionsInput,
  availableActions,
} from "./availableActions";

const base: AvailableActionsInput = {
  working: null,
  live: null,
  canEdit: true,
  canPublish: false,
  mustReview: false,
  isReviewer: false,
  isAuthor: true,
};

describe("availableActions", () => {
  test("an editor without publish can save a draft and then submit it", () => {
    expect(availableActions(base)).toEqual(["saveDraft"]);
    expect(availableActions({ ...base, working: "DRAFT" })).toEqual([
      "saveDraft",
      "submit",
    ]);
  });

  test("publish is offered only without mandatory review", () => {
    const draft = { ...base, working: "DRAFT", canPublish: true } as const;
    expect(availableActions(draft)).toContain("publish");
    expect(availableActions({ ...draft, mustReview: true })).not.toContain(
      "publish",
    );
  });

  test("a revision in review can be decided only by a reviewer who is not its author", () => {
    const inReview = {
      ...base,
      working: "IN_REVIEW",
      isReviewer: true,
    } as const;
    expect(availableActions({ ...inReview, isAuthor: false })).toEqual([
      "approve",
      "requestChanges",
    ]);
    expect(availableActions(inReview)).toEqual([]);
    expect(
      availableActions({ ...inReview, isAuthor: false, isReviewer: false }),
    ).toEqual([]);
  });

  test("changes requested go back to editing", () => {
    expect(availableActions({ ...base, working: "CHANGES_REQUESTED" })).toEqual(
      ["saveDraft"],
    );
  });

  test("live content can be paused, paused content resumed, both with publish", () => {
    const live = { ...base, canEdit: false, canPublish: true } as const;
    expect(availableActions({ ...live, live: "PUBLISHED" })).toEqual(["pause"]);
    expect(availableActions({ ...live, live: "PAUSED" })).toEqual(["resume"]);
    expect(
      availableActions({ ...live, canPublish: false, live: "PUBLISHED" }),
    ).toEqual([]);
  });

  test("resume is not offered while a working revision exists, and is exempt from mandatory review", () => {
    const paused = { ...base, canPublish: true, live: "PAUSED" } as const;
    expect(availableActions({ ...paused, mustReview: true })).toContain(
      "resume",
    );
    expect(availableActions({ ...paused, working: "DRAFT" })).not.toContain(
      "resume",
    );
  });

  test("nothing at all without permissions", () => {
    expect(
      availableActions({ ...base, canEdit: false, working: "DRAFT" }),
    ).toEqual([]);
  });
});
