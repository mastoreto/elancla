import { describe, expect, test } from "bun:test";
import { buildUserOptions, NO_USER_VALUE } from "./buildUserOptions";

const USERS = [{ id: "u1", name: "Ana", email: "ana@example.org" }];

describe("buildUserOptions", () => {
  test("starts with the no-user option and labels users with their email", () => {
    expect(buildUserOptions(USERS, null)).toEqual([
      { value: NO_USER_VALUE, label: "Sin usuario vinculado" },
      { value: "u1", label: "Ana (ana@example.org)" },
    ]);
  });

  test("keeps a linked user that is not in the list", () => {
    const options = buildUserOptions([], "u9");
    expect(options.at(-1)).toEqual({ value: "u9", label: "Usuario vinculado" });
  });

  test("does not repeat a linked user that is in the list", () => {
    expect(buildUserOptions(USERS, "u1")).toHaveLength(2);
  });
});
