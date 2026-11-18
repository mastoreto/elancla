import { describe, expect, test } from "bun:test";
import { assertAdminSession, UnauthorizedActionError } from "./assertAdminSession";

describe("assertAdminSession", () => {
  test("rejects a missing session", () => {
    expect(() => assertAdminSession(null)).toThrow(UnauthorizedActionError);
  });

  test("rejects a non-admin user", () => {
    expect(() => assertAdminSession({ user: { role: "viewer" } })).toThrow(UnauthorizedActionError);
  });

  test("rejects a user without role", () => {
    expect(() => assertAdminSession({ user: {} })).toThrow(UnauthorizedActionError);
  });

  test("accepts an admin", () => {
    expect(() => assertAdminSession({ user: { role: "admin" } })).not.toThrow();
  });
});
