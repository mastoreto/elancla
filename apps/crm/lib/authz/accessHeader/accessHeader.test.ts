import { describe, expect, test } from "bun:test";
import { grant, PERMISSIONS } from "@ancla/contracts";
import { parseAccess, serializeAccess } from "./accessHeader";

const access = {
  isAdmin: false,
  roles: [{ id: "01900000-0000-7000-8000-000000000001", name: "Líder" }],
  grants: [grant(PERMISSIONS.requests.view, "ministry")],
  ministryIds: [],
} as const;

describe("access header", () => {
  test("round-trips, including non-ASCII role names", () => {
    const value = serializeAccess({
      ...access,
      grants: [...access.grants],
      roles: [...access.roles],
    });
    expect(parseAccess(value)?.roles[0]?.name).toBe("Líder");
  });

  test("missing, garbage or wrongly-shaped values parse to null", () => {
    expect(parseAccess(null)).toBeNull();
    expect(parseAccess("not-base64-json")).toBeNull();
    expect(parseAccess(Buffer.from('{"isAdmin":"yes"}').toString("base64"))).toBeNull();
  });
});
