import { describe, expect, test } from "bun:test";
import { readInviteArguments } from "./readInviteArguments";

describe("readInviteArguments", () => {
  test("reads the email alone", () => {
    expect(readInviteArguments(["ana@example.org"])).toEqual({
      email: "ana@example.org",
      role: undefined,
    });
  });

  test("reads the email and the role in any order", () => {
    const expected = { email: "ana@example.org", role: "admin" };
    expect(readInviteArguments(["ana@example.org", "--role", "admin"])).toEqual(
      expected,
    );
    expect(readInviteArguments(["--role", "admin", "ana@example.org"])).toEqual(
      expected,
    );
  });

  test("returns no email when only the flag is given", () => {
    expect(readInviteArguments(["--role", "admin"]).email).toBeUndefined();
  });
});
