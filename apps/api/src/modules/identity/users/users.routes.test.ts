import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { UserDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import { createApiCaller } from "../../../../test/support/apiCaller";
import { grant } from "../../../../test/support/authzMatrix";
import { createFixtures } from "../../../../test/support/fixtures";
import { getAuth } from "../../../core/auth";
import type { AuthenticatedContext } from "../../../core/context";
import { ConflictError } from "../../../core/errors";
import { setUserRoles } from "./useCases";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);
const organizationsToRemove: string[] = [];

let adminCookie = "";
let adminId = "";
let editorCookie = "";
let adminRoleId = "";

afterAll(async () => {
  await db.organization.deleteMany({
    where: { id: { in: organizationsToRemove } },
  });
  await fixtures.cleanup();
});

async function userIdOf(email: string): Promise<string> {
  return (await db.user.findUniqueOrThrow({ where: { email } })).id;
}

beforeAll(async () => {
  const auth = getAuth();
  adminRoleId = await fixtures.roleIdByKey("admin");
  const adminEmail = await fixtures.passwordUser(auth, "users-admin", [
    "admin",
  ]);
  adminId = await userIdOf(adminEmail);
  adminCookie = await fixtures.signIn(auth, adminEmail);
  // Can edit users but is not an admin.
  editorCookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, "users-editor", [grant("users", "edit")]),
  );
});

async function newUser(label: string) {
  const email = await fixtures.passwordUser(getAuth(), label);
  return { email, id: await userIdOf(email) };
}

describe("GET /api/users", () => {
  test("lists users with roles, ministries and last access", async () => {
    const target = await newUser("listed");
    const ministryId = await fixtures.createMinistry("listed");
    const leaderId = await fixtures.roleIdByKey("leader");
    await db.userRole.create({ data: { userId: target.id, roleId: leaderId } });
    await db.userMinistry.create({ data: { userId: target.id, ministryId } });
    await fixtures.signIn(getAuth(), target.email);

    const res = await call("GET", "/users?limit=100", { cookie: adminCookie });
    expect(res.status).toBe(200);
    const { items } = (await res.json()) as { items: UserDto[] };
    const found = items.find((user) => user.id === target.id);
    expect(found?.roles.map((role) => role.id)).toEqual([leaderId]);
    expect(found?.ministries.map((ministry) => ministry.id)).toEqual([
      ministryId,
    ]);
    expect(found?.lastAccessAt).not.toBeNull();
    expect(JSON.stringify(found)).not.toContain("password");
  });
});

describe("PUT /api/users/:id/roles", () => {
  test("replaces the roles of another user and the change takes effect", async () => {
    const target = await newUser("reassigned");
    const leaderId = await fixtures.roleIdByKey("leader");
    const res = await call("PUT", `/users/${target.id}/roles`, {
      cookie: adminCookie,
      body: { roleIds: [leaderId] },
    });
    expect(res.status).toBe(200);
    expect(((await res.json()) as UserDto).roles.map((r) => r.id)).toEqual([
      leaderId,
    ]);

    const meRes = await call("GET", "/me/permissions", {
      cookie: await fixtures.signIn(getAuth(), target.email),
    });
    const me = (await meRes.json()) as { roles: { id: string }[] };
    expect(me.roles.map((role) => role.id)).toEqual([leaderId]);

    const cleared = await call("PUT", `/users/${target.id}/roles`, {
      cookie: adminCookie,
      body: { roleIds: [] },
    });
    expect(((await cleared.json()) as UserDto).roles).toEqual([]);
  });

  test("nobody changes their own roles or ministries", async () => {
    const roles = await call("PUT", `/users/${adminId}/roles`, {
      cookie: adminCookie,
      body: { roleIds: [adminRoleId] },
    });
    expect(roles.status).toBe(403);
    const ministries = await call("PUT", `/users/${adminId}/ministries`, {
      cookie: adminCookie,
      body: { ministryIds: [] },
    });
    expect(ministries.status).toBe(403);
  });

  test("an unknown role is a 400 and an unknown user a 404", async () => {
    const target = await newUser("unknown-role");
    const unknown = crypto.randomUUID();
    const bad = await call("PUT", `/users/${target.id}/roles`, {
      cookie: adminCookie,
      body: { roleIds: [unknown] },
    });
    expect(bad.status).toBe(400);
    const missing = await call("PUT", `/users/${unknown}/roles`, {
      cookie: adminCookie,
      body: { roleIds: [] },
    });
    expect(missing.status).toBe(404);
  });

  test("only an admin grants the admin role (no escalation through users:edit)", async () => {
    const target = await newUser("escalation");
    const res = await call("PUT", `/users/${target.id}/roles`, {
      cookie: editorCookie,
      body: { roleIds: [adminRoleId] },
    });
    expect(res.status).toBe(403);
    expect(await db.userRole.count({ where: { userId: target.id } })).toBe(0);
  });

  test("an admin can remove the admin role from another admin while two exist", async () => {
    const other = await newUser("second-admin");
    await db.userRole.create({
      data: { userId: other.id, roleId: adminRoleId },
    });
    const res = await call("PUT", `/users/${other.id}/roles`, {
      cookie: adminCookie,
      body: { roleIds: [] },
    });
    expect(res.status).toBe(200);
  });
});

describe("the last admin", () => {
  test("cannot lose the admin role", async () => {
    // A throwaway organization, so this admin really is the only one (the shared one has several).
    const organization = await db.organization.create({
      data: {
        slug: `last-admin-${crypto.randomUUID()}`,
        name: "Last admin test",
        country: "UY",
        timezone: "America/Montevideo",
        defaultLocale: "es",
        locales: ["es"],
        currencies: ["UYU"],
      },
    });
    organizationsToRemove.push(organization.id);
    const adminRole = await db.role.create({
      data: {
        organizationId: organization.id,
        key: "admin",
        name: "Administrador",
      },
    });
    const sole = await newUser("sole-admin");
    await db.userRole.create({
      data: { userId: sole.id, roleId: adminRole.id },
    });

    const actor = await newUser("actor");
    const ctx: AuthenticatedContext = {
      requestId: "test",
      organizationId: organization.id,
      user: { id: actor.id, name: "Actor", email: actor.email },
      access: {
        isAdmin: true,
        roles: [],
        grants: new Map(),
        ministryIds: [],
        sessionPolicy: { persistent: true, maxSessionSeconds: null },
      },
    };

    await expect(
      setUserRoles({ ctx, userId: sole.id, body: { roleIds: [] } }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(await db.userRole.count({ where: { roleId: adminRole.id } })).toBe(
      1,
    );

    // With a second admin the first can be demoted.
    const second = await newUser("second");
    await db.userRole.create({
      data: { userId: second.id, roleId: adminRole.id },
    });
    await setUserRoles({ ctx, userId: sole.id, body: { roleIds: [] } });
    expect(await db.userRole.count({ where: { roleId: adminRole.id } })).toBe(
      1,
    );
  });
});

describe("PUT /api/users/:id/ministries", () => {
  test("replaces the ministries of another user", async () => {
    const target = await newUser("ministries");
    const ministryId = await fixtures.createMinistry("assign");
    const res = await call("PUT", `/users/${target.id}/ministries`, {
      cookie: adminCookie,
      body: { ministryIds: [ministryId] },
    });
    expect(res.status).toBe(200);
    expect(
      ((await res.json()) as UserDto).ministries.map((ministry) => ministry.id),
    ).toEqual([ministryId]);

    const bad = await call("PUT", `/users/${target.id}/ministries`, {
      cookie: adminCookie,
      body: { ministryIds: [crypto.randomUUID()] },
    });
    expect(bad.status).toBe(400);
  });
});
