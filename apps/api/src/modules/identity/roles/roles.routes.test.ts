import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { RoleDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import { createApiCaller } from "../../../../test/support/apiCaller";
import { grant } from "../../../../test/support/authzMatrix";
import { createFixtures } from "../../../../test/support/fixtures";
import { getAuth } from "../../../core/auth";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);
const createdRoleIds: string[] = [];

let adminCookie = "";

afterAll(async () => {
  await db.role.deleteMany({ where: { id: { in: createdRoleIds } } });
  await fixtures.cleanup();
});

beforeAll(async () => {
  const auth = getAuth();
  adminCookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, "roles-admin", ["admin"]),
  );
});

const uniqueName = (label: string) => `Test ${label} ${crypto.randomUUID()}`;

async function createRole(body: unknown, cookie = adminCookie) {
  const res = await call("POST", "/roles", { body, cookie });
  if (res.status === 201) {
    createdRoleIds.push(((await res.clone().json()) as RoleDto).id);
  }
  return res;
}

describe("roles CRUD", () => {
  test("creates a role with a per-cell scope and returns the grid", async () => {
    const res = await createRole({
      name: uniqueName("create"),
      description: "Cells with their own scope",
      persistentSession: false,
      maxSessionSeconds: 3600,
      grants: [
        grant("requests", "view", "ministry"),
        grant("requests", "create", "own"),
        grant("movements", "view", "all"),
      ],
    });
    expect(res.status).toBe(201);
    const role = (await res.json()) as RoleDto;
    expect(role).toMatchObject({
      key: null,
      persistentSession: false,
      maxSessionSeconds: 3600,
      memberCount: 0,
    });
    expect(role.grants).toHaveLength(3);
    expect(role.grants).toContainEqual(grant("requests", "create", "own"));

    const listed = (await (
      await call("GET", "/roles", { cookie: adminCookie })
    ).json()) as RoleDto[];
    expect(listed.some((item) => item.id === role.id)).toBe(true);
    const single = await call("GET", `/roles/${role.id}`, {
      cookie: adminCookie,
    });
    expect(((await single.json()) as RoleDto).id).toBe(role.id);
  });

  test("rejects a grid the catalog does not support with a 400", async () => {
    for (const bad of [
      grant("users", "view", "own"),
      grant("settings", "approve", "all"),
      { resource: "nope", action: "view", scope: "all" },
    ]) {
      const res = await createRole({ name: uniqueName("bad"), grants: [bad] });
      expect(res.status).toBe(400);
    }
    const duplicated = await createRole({
      name: uniqueName("dup-grant"),
      grants: [grant("movements", "view"), grant("movements", "view")],
    });
    expect(duplicated.status).toBe(400);
  });

  test("a repeated name is a 409", async () => {
    const name = uniqueName("same-name");
    expect((await createRole({ name, grants: [] })).status).toBe(201);
    expect((await createRole({ name, grants: [] })).status).toBe(409);
  });

  test("PATCH replaces the name, session policy and the whole grid", async () => {
    const created = (await (
      await createRole({
        name: uniqueName("patch"),
        grants: [grant("movements", "view"), grant("reports", "view")],
      })
    ).json()) as RoleDto;

    const res = await call("PATCH", `/roles/${created.id}`, {
      cookie: adminCookie,
      body: {
        name: `${created.name} v2`,
        persistentSession: false,
        maxSessionSeconds: 600,
        grants: [grant("budgets", "view", "ministry")],
      },
    });
    expect(res.status).toBe(200);
    const updated = (await res.json()) as RoleDto;
    expect(updated.name).toBe(`${created.name} v2`);
    expect(updated.grants).toEqual([grant("budgets", "view", "ministry")]);
    expect(updated.maxSessionSeconds).toBe(600);
  });

  test("a role with members cannot be deleted; an empty custom one can", async () => {
    const created = (await (
      await createRole({ name: uniqueName("delete"), grants: [] })
    ).json()) as RoleDto;
    const auth = getAuth();
    const member = await fixtures.passwordUser(auth, "member");
    const memberRow = await db.user.findUniqueOrThrow({
      where: { email: member },
    });
    await db.userRole.create({
      data: { userId: memberRow.id, roleId: created.id },
    });

    const blocked = await call("DELETE", `/roles/${created.id}`, {
      cookie: adminCookie,
    });
    expect(blocked.status).toBe(409);

    await db.userRole.deleteMany({ where: { roleId: created.id } });
    const deleted = await call("DELETE", `/roles/${created.id}`, {
      cookie: adminCookie,
    });
    expect(deleted.status).toBe(204);
    const gone = await call("GET", `/roles/${created.id}`, {
      cookie: adminCookie,
    });
    expect(gone.status).toBe(404);
  });
});

describe("role protections", () => {
  test("the admin role can be neither edited nor deleted", async () => {
    const adminRoleId = await fixtures.roleIdByKey("admin");
    const patch = await call("PATCH", `/roles/${adminRoleId}`, {
      cookie: adminCookie,
      body: { name: "Hacked", grants: [] },
    });
    expect(patch.status).toBe(403);
    const del = await call("DELETE", `/roles/${adminRoleId}`, {
      cookie: adminCookie,
    });
    expect(del.status).toBe(403);
  });

  test("seeded roles are not deletable", async () => {
    const leaderId = await fixtures.roleIdByKey("leader");
    const res = await call("DELETE", `/roles/${leaderId}`, {
      cookie: adminCookie,
    });
    expect(res.status).toBe(409);
  });

  test("nobody edits a role they hold (no self-elevation through the grid)", async () => {
    const auth = getAuth();
    const ownRoleId = await fixtures.createRole("own", {
      grants: [grant("roles", "edit")],
    });
    const email = fixtures.uniqueEmail("holder");
    await fixtures.invite(email, { roleIds: [ownRoleId] });
    await auth.api.signUpEmail({
      body: { email, password: "correct-horse-battery-staple", name: "H" },
    });
    const cookie = await fixtures.signIn(auth, email);

    const own = await call("PATCH", `/roles/${ownRoleId}`, {
      cookie,
      body: {
        name: "Elevated",
        grants: [grant("roles", "edit"), grant("users", "edit")],
      },
    });
    expect(own.status).toBe(403);
    const stillTheSame = await db.rolePermission.count({
      where: { roleId: ownRoleId },
    });
    expect(stillTheSame).toBe(1);
  });

  test("even an admin cannot edit a custom role they hold", async () => {
    const auth = getAuth();
    const heldRoleId = await fixtures.createRole("admin-held");
    const email = fixtures.uniqueEmail("admin-holder");
    await fixtures.invite(email, {
      roleIds: [await fixtures.roleIdByKey("admin"), heldRoleId],
    });
    await auth.api.signUpEmail({
      body: { email, password: "correct-horse-battery-staple", name: "AH" },
    });
    const cookie = await fixtures.signIn(auth, email);
    const res = await call("PATCH", `/roles/${heldRoleId}`, {
      cookie,
      body: { name: "Renamed", grants: [] },
    });
    expect(res.status).toBe(403);
  });

  test("managing roles is admin-only, even with every roles:* permission", async () => {
    const auth = getAuth();
    const cookie = await fixtures.signIn(
      auth,
      await fixtures.passwordUser(auth, "roles-manager", [
        grant("roles", "view"),
        grant("roles", "create"),
        grant("roles", "edit"),
        grant("roles", "delete"),
      ]),
    );
    const other = (await (
      await createRole({ name: uniqueName("other"), grants: [] })
    ).json()) as RoleDto;
    const body = { name: uniqueName("by-manager"), grants: [] };
    expect((await call("POST", "/roles", { cookie, body })).status).toBe(403);
    expect(
      (await call("PATCH", `/roles/${other.id}`, { cookie, body })).status,
    ).toBe(403);
    expect(
      (await call("DELETE", `/roles/${other.id}`, { cookie })).status,
    ).toBe(403);
    // Reading stays allowed.
    expect((await call("GET", "/roles", { cookie })).status).toBe(200);
  });
});
