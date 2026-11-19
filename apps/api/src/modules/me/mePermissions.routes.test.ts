import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { MePermissionsDto } from "@ancla/contracts";
import { createApiCaller } from "../../../test/support/apiCaller";
import { grant } from "../../../test/support/authzMatrix";
import { createFixtures } from "../../../test/support/fixtures";
import { getAuth } from "../../core/auth";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

afterAll(() => fixtures.cleanup());

async function permissionsOf(cookie: string): Promise<MePermissionsDto> {
  const res = await call("GET", "/me/permissions", { cookie });
  expect(res.status).toBe(200);
  return (await res.json()) as MePermissionsDto;
}

describe("GET /api/me/permissions", () => {
  let ministryId = "";
  beforeAll(async () => {
    ministryId = await fixtures.createMinistry("me");
  });

  test("the admin is flagged and needs no rows", async () => {
    const auth = getAuth();
    const cookie = await fixtures.signIn(
      auth,
      await fixtures.passwordUser(auth, "me-admin", ["admin"]),
    );
    const me = await permissionsOf(cookie);
    expect(me.isAdmin).toBe(true);
    expect(me.roles.map((role) => role.name)).toContain("Administrador");
    expect(me.grants).toEqual([]);
  });

  test("merges two roles: the union, with the widest scope per permission", async () => {
    const auth = getAuth();
    const first = await fixtures.createRole("first", {
      grants: [grant("requests", "view", "own"), grant("movements", "view")],
    });
    const second = await fixtures.createRole("second", {
      grants: [
        grant("requests", "view", "all"),
        grant("budgets", "view", "ministry"),
      ],
    });
    const email = fixtures.uniqueEmail("me-merged");
    await fixtures.invite(email, {
      roleIds: [first, second],
      ministryIds: [ministryId],
    });
    await auth.api.signUpEmail({
      body: { email, password: "correct-horse-battery-staple", name: "Merged" },
    });
    const me = await permissionsOf(await fixtures.signIn(auth, email));

    expect(me.isAdmin).toBe(false);
    expect(me.ministryIds).toEqual([ministryId]);
    expect(me.grants).toHaveLength(3);
    expect(me.grants).toContainEqual(grant("requests", "view", "all"));
    expect(me.grants).toContainEqual(grant("movements", "view", "all"));
    expect(me.grants).toContainEqual(grant("budgets", "view", "ministry"));
  });

  test("a user without roles has an empty menu", async () => {
    const auth = getAuth();
    const cookie = await fixtures.signIn(
      auth,
      await fixtures.passwordUser(auth, "me-none"),
    );
    expect(await permissionsOf(cookie)).toMatchObject({
      isAdmin: false,
      roles: [],
      grants: [],
      ministryIds: [],
    });
  });
});
