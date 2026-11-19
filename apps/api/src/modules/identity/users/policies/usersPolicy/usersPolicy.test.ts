import { describe, expect, test } from "bun:test";
import { assertAdminRoleChangeAllowed, assertNotSelf } from "./usersPolicy";

const base = {
  access: { isAdmin: true },
  adminRoleId: "admin",
  hadAdminRole: true,
  keepsAdminRole: false,
  adminCount: 2,
};

describe("users policy", () => {
  test("rejects changing yourself", () => {
    expect(() => assertNotSelf("a", "a")).toThrow();
    expect(() => assertNotSelf("a", "b")).not.toThrow();
  });

  test("the last admin cannot lose the role", () => {
    expect(() =>
      assertAdminRoleChangeAllowed({ ...base, adminCount: 1 }),
    ).toThrow("last admin");
    expect(() => assertAdminRoleChangeAllowed(base)).not.toThrow();
  });

  test("only an admin changes the admin role", () => {
    expect(() =>
      assertAdminRoleChangeAllowed({
        ...base,
        access: { isAdmin: false },
        hadAdminRole: false,
        keepsAdminRole: true,
      }),
    ).toThrow("Only an admin");
  });

  test("changes that do not touch the admin role pass for anyone", () => {
    expect(() =>
      assertAdminRoleChangeAllowed({
        ...base,
        access: { isAdmin: false },
        hadAdminRole: false,
        keepsAdminRole: false,
      }),
    ).not.toThrow();
  });
});
