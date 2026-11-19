import { describe, expect, test } from "bun:test";
import { invitationRoleCopy } from "./invitationRoleCopy";

describe("invitationRoleCopy", () => {
  test("lists every role name", () => {
    expect(invitationRoleCopy(["Líder", "Tesorero"]).roleName).toBe(
      "Líder, Tesorero",
    );
  });

  test("falls back when the roles no longer exist", () => {
    expect(invitationRoleCopy([]).roleName).toBe("Sin rol");
  });
});
