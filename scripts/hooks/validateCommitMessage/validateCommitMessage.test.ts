import { describe, expect, test } from "bun:test";
import { validateCommitMessage } from "./validateCommitMessage";

describe("validateCommitMessage", () => {
  test("accepts a conventional header with scope", () => {
    expect(
      validateCommitMessage("feat(crm): add the audit filters\n\nBody.").valid,
    ).toBe(true);
  });

  test("accepts a header without scope and a breaking mark", () => {
    expect(validateCommitMessage("chore: bump bun").valid).toBe(true);
    expect(validateCommitMessage("feat(api)!: drop the v1 routes").valid).toBe(
      true,
    );
  });

  test("rejects a header that is not conventional, with an example", () => {
    const result = validateCommitMessage("added some stuff");
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("type(scope): subject");
  });

  test("rejects an unknown type and an uppercase scope", () => {
    expect(validateCommitMessage("feature(crm): x").valid).toBe(false);
    expect(validateCommitMessage("feat(CRM): x").valid).toBe(false);
  });

  test("rejects a header over 100 characters", () => {
    expect(validateCommitMessage(`fix(api): ${"a".repeat(100)}`).valid).toBe(
      false,
    );
  });

  test("lets git's own Merge and Revert headers through", () => {
    expect(
      validateCommitMessage("Merge branch 'develop' into feat/x").valid,
    ).toBe(true);
    expect(validateCommitMessage('Revert "feat(api): add x"').valid).toBe(true);
  });

  test("rejects Co-Authored-By in any case", () => {
    const result = validateCommitMessage(
      "fix(api): ok\n\nco-authored-by: Someone <a@b.c>",
    );
    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toContain("Co-Authored-By");
  });

  test("rejects the Claude Code generated line", () => {
    const result = validateCommitMessage(
      "fix(api): ok\n\nGenerated with [Claude Code](https://x)",
    );
    expect(result.valid).toBe(false);
  });

  test("ignores git comment lines when finding the header", () => {
    expect(validateCommitMessage("# comment\nfix(api): ok").valid).toBe(true);
  });

  test("rejects an empty message", () => {
    expect(validateCommitMessage("\n# only comments").valid).toBe(false);
  });
});
