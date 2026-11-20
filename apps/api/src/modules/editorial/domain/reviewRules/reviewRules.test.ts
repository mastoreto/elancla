import { describe, expect, test } from "bun:test";
import { isReviewer, mustBeReviewed, NO_REVIEW_SETTINGS } from "./reviewRules";

const settings = {
  ...NO_REVIEW_SETTINGS,
  reviewerUserIds: ["u-reviewer"],
  reviewerRoleIds: ["r-reviewers"],
  mandatoryReviewUserIds: ["u-junior"],
  mandatoryReviewRoleIds: ["r-interns"],
};

describe("review rules", () => {
  test("a reviewer is the admin, a listed user or someone with a listed role", () => {
    expect(
      isReviewer(settings, { userId: "x", roleIds: [], isAdmin: true }),
    ).toBe(true);
    expect(isReviewer(settings, { userId: "u-reviewer", roleIds: [] })).toBe(
      true,
    );
    expect(
      isReviewer(settings, { userId: "x", roleIds: ["r-reviewers"] }),
    ).toBe(true);
    expect(isReviewer(settings, { userId: "x", roleIds: ["other"] })).toBe(
      false,
    );
    expect(isReviewer(NO_REVIEW_SETTINGS, { userId: "x", roleIds: [] })).toBe(
      false,
    );
  });

  test("mandatory review applies by user or by role", () => {
    expect(mustBeReviewed(settings, { userId: "u-junior", roleIds: [] })).toBe(
      true,
    );
    expect(
      mustBeReviewed(settings, { userId: "x", roleIds: ["r-interns"] }),
    ).toBe(true);
    expect(
      mustBeReviewed(settings, { userId: "x", roleIds: ["r-reviewers"] }),
    ).toBe(false);
  });
});
