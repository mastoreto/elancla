import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  type AuditLogDto,
  grant,
  type Page,
  PERMISSIONS,
  type RoleDto,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import {
  createApiCaller,
  TEST_USER_AGENT,
} from "../../../test/support/apiCaller";
import { auditRowsOf, requestIdOf } from "../../../test/support/auditRows";
import { createFixtures } from "../../../test/support/fixtures";
import { createRecordingMailer } from "../../../test/support/recordingMailer";
import { auditSourceForCli } from "../../core/audit";
import { getAuth } from "../../core/auth";
import { setMailerForTests } from "../../core/mail";
import { resolveOrganizationId } from "../../core/tenancy";
import { issueInvitation } from "../identity/invitations/useCases";
import { listAuditRows } from "./data";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);
const createdRoleIds: string[] = [];

let adminCookie = "";
let adminEmail = "";
let auditorCookie = "";
let nobodyCookie = "";
let nobodyEmail = "";
let targetUserId = "";

afterAll(async () => {
  setMailerForTests(undefined);
  await db.role.deleteMany({ where: { id: { in: createdRoleIds } } });
  await fixtures.cleanup();
});

beforeAll(async () => {
  setMailerForTests(createRecordingMailer());
  const auth = getAuth();
  adminEmail = await fixtures.passwordUser(auth, "audit-admin", ["admin"]);
  adminCookie = await fixtures.signIn(auth, adminEmail);
  auditorCookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, "audit-reader", [
      grant(PERMISSIONS.audit.view),
    ]),
  );
  nobodyEmail = await fixtures.passwordUser(auth, "audit-nobody");
  nobodyCookie = await fixtures.signIn(auth, nobodyEmail);
  const target = await fixtures.passwordUser(auth, "audit-target");
  targetUserId = (await db.user.findUniqueOrThrow({ where: { email: target } }))
    .id;
});

const uniqueName = (label: string) => `Audit ${label} ${crypto.randomUUID()}`;

async function createRole(
  name: string,
): Promise<{ id: string; res: Response }> {
  const res = await call("POST", "/roles", {
    cookie: adminCookie,
    body: { name, grants: [grant(PERMISSIONS.movements.view)] },
  });
  const { id } = (await res.clone().json()) as RoleDto;
  createdRoleIds.push(id);
  return { id, res };
}

async function listAudit(query: string, cookie = auditorCookie) {
  const res = await call("GET", `/audit${query}`, { cookie });
  return { res, page: (await res.json()) as Page<AuditLogDto> };
}

describe("GET /api/audit access", () => {
  test("401 anonymous, 403 without audit:view, 200 for the reader and the admin", async () => {
    expect((await call("GET", "/audit")).status).toBe(401);
    expect((await call("GET", "/audit", { cookie: nobodyCookie })).status).toBe(
      403,
    );
    expect(
      (await call("GET", "/audit", { cookie: auditorCookie })).status,
    ).toBe(200);
    expect((await call("GET", "/audit", { cookie: adminCookie })).status).toBe(
      200,
    );
  });

  test("the trail has no write endpoints", async () => {
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      const res = await call(method, "/audit", {
        cookie: adminCookie,
        body: {},
      });
      expect([404, 405]).toContain(res.status);
    }
  });
});

describe("mutations leave their record", () => {
  test("a role created, updated and deleted keeps before/after, actor, address and agent", async () => {
    const name = uniqueName("lifecycle");
    const { id, res: created } = await createRole(name);
    const renamed = `${name} v2`;
    const updated = await call("PATCH", `/roles/${id}`, {
      cookie: adminCookie,
      body: { name: renamed, grants: [grant(PERMISSIONS.movements.view)] },
    });
    const deleted = await call("DELETE", `/roles/${id}`, {
      cookie: adminCookie,
    });
    expect([created.status, updated.status, deleted.status]).toEqual([
      201, 200, 204,
    ]);

    const rows = await auditRowsOf({ entityId: id });
    expect(rows.map((row) => row.action)).toEqual([
      "role.created",
      "role.updated",
      "role.deleted",
    ]);
    expect(rows[0]).toMatchObject({
      actorLabel: adminEmail,
      userAgent: TEST_USER_AGENT,
      outcome: "success",
      requestId: requestIdOf(created),
    });
    expect(rows[0]?.ip).toMatch(/^10\./);
    expect((rows[1]?.before as { name: string }).name).toBe(name);
    expect((rows[1]?.after as { name: string }).name).toBe(renamed);
    expect((rows[2]?.before as { name: string }).name).toBe(renamed);
  });

  test("a rolled-back update (duplicate name) leaves nothing", async () => {
    const first = await createRole(uniqueName("first"));
    const second = await createRole(uniqueName("second"));
    const firstName = (
      (await (
        await call("GET", `/roles/${first.id}`, { cookie: adminCookie })
      ).json()) as RoleDto
    ).name;

    const clash = await call("PATCH", `/roles/${second.id}`, {
      cookie: adminCookie,
      body: { name: firstName, grants: [] },
    });
    expect(clash.status).toBe(409);
    const actions = (await auditRowsOf({ entityId: second.id })).map(
      (row) => row.action,
    );
    expect(actions).toEqual(["role.created"]);
  });

  test("assigning roles and ministries records before and after with the user's email", async () => {
    const roleId = await fixtures.roleIdByKey("treasurer");
    const ministryId = await fixtures.createMinistry("audit");
    const roles = await call("PUT", `/users/${targetUserId}/roles`, {
      cookie: adminCookie,
      body: { roleIds: [roleId] },
    });
    const ministries = await call("PUT", `/users/${targetUserId}/ministries`, {
      cookie: adminCookie,
      body: { ministryIds: [ministryId] },
    });
    expect([roles.status, ministries.status]).toEqual([200, 200]);

    const rows = await auditRowsOf({ entityId: targetUserId });
    const rolesRow = rows.find((row) => row.action === "user.roles.changed");
    const ministriesRow = rows.find(
      (row) => row.action === "user.ministries.changed",
    );
    expect(rolesRow?.before).toEqual({ roles: [] });
    expect((rolesRow?.after as { roles: { id: string }[] }).roles[0]?.id).toBe(
      roleId,
    );
    expect(rolesRow?.metadata).toMatchObject({
      entityLabel: expect.stringContaining("@"),
    });
    expect(
      (ministriesRow?.after as { ministries: { id: string }[] }).ministries[0]
        ?.id,
    ).toBe(ministryId);
  });

  test("invitations record creation and revocation, never the token hash", async () => {
    const email = fixtures.uniqueEmail("audit-invite");
    const created = await call("POST", "/invitations", {
      cookie: adminCookie,
      body: { email, roleIds: [await fixtures.roleIdByKey("treasurer")] },
    });
    expect(created.status).toBe(201);
    const { id } = (await created.json()) as { id: string };
    expect(
      (await call("POST", `/invitations/${id}/revoke`, { cookie: adminCookie }))
        .status,
    ).toBe(200);

    const rows = await auditRowsOf({ entityId: id });
    expect(rows.map((row) => row.action)).toEqual([
      "invitation.created",
      "invitation.revoked",
    ]);
    expect(JSON.stringify(rows)).not.toContain("tokenHash");
    expect(rows[0]?.metadata).toMatchObject({ entityLabel: email });
  });

  test("an invitation issued from the CLI is audited with the cli actor", async () => {
    const email = fixtures.uniqueEmail("audit-cli");
    const organizationId = await resolveOrganizationId();
    const { invitation } = await issueInvitation({
      organizationId,
      email,
      roleIds: [await fixtures.roleIdByKey("treasurer")],
      ministryIds: [],
      invitedById: null,
      audit: auditSourceForCli(organizationId),
    });
    const [row] = await auditRowsOf({ entityId: invitation.id });
    expect(row).toMatchObject({
      action: "invitation.created",
      actorId: null,
      actorLabel: "cli",
    });
  });
});

describe("denials", () => {
  test("a 403 records permission.denied with who, what and where", async () => {
    const res = await call("GET", "/roles", { cookie: nobodyCookie });
    expect(res.status).toBe(403);
    const [row] = await auditRowsOf({ requestId: requestIdOf(res) });
    expect(row).toMatchObject({
      action: "permission.denied",
      outcome: "denied",
      actorLabel: nobodyEmail,
      userAgent: TEST_USER_AGENT,
      metadata: { method: "GET", path: "/api/roles" },
    });
  });

  test("a 401 is not a denial", async () => {
    const res = await call("GET", "/roles");
    expect(res.status).toBe(401);
    expect(await auditRowsOf({ requestId: requestIdOf(res) })).toHaveLength(0);
  });
});

describe("GET /api/audit filters and pages", () => {
  test("filters by action, entity, actor text and outcome", async () => {
    const { id } = await createRole(uniqueName("filter"));
    const byEntity = await listAudit(`?entityId=${id}`);
    expect(byEntity.page.items.map((item) => item.action)).toEqual([
      "role.created",
    ]);

    const byAction = await listAudit(`?action=role.created&entityId=${id}`);
    expect(byAction.page.items).toHaveLength(1);
    const none = await listAudit(`?action=role.deleted&entityId=${id}`);
    expect(none.page.items).toHaveLength(0);

    const byActor = await listAudit(
      `?entityId=${id}&actor=${adminEmail.slice(0, 12).toUpperCase()}`,
    );
    expect(byActor.page.items).toHaveLength(1);

    await call("GET", "/roles", { cookie: nobodyCookie });
    const denied = await listAudit(
      `?outcome=denied&actor=${encodeURIComponent(nobodyEmail)}`,
    );
    expect(denied.page.items.length).toBeGreaterThan(0);
    expect(denied.page.items.every((item) => item.outcome === "denied")).toBe(
      true,
    );
  });

  test("a date range excludes what happened before it", async () => {
    const { id } = await createRole(uniqueName("range"));
    const future = new Date(Date.now() + 60_000).toISOString();
    expect(
      (await listAudit(`?entityId=${id}&from=${encodeURIComponent(future)}`))
        .page.items,
    ).toHaveLength(0);
    const past = new Date(Date.now() - 60_000).toISOString();
    expect(
      (await listAudit(`?entityId=${id}&from=${encodeURIComponent(past)}`)).page
        .items,
    ).toHaveLength(1);
  });

  test("pages newest first without repeating rows", async () => {
    const first = await listAudit("?limit=2");
    expect(first.page.items).toHaveLength(2);
    expect(first.page.nextCursor).not.toBeNull();
    const second = await listAudit(`?limit=2&cursor=${first.page.nextCursor}`);
    const ids = [...first.page.items, ...second.page.items].map(
      (item) => item.id,
    );
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort().reverse()).toEqual(ids);
  });

  test("rejects an unknown outcome and a bad limit", async () => {
    expect((await listAudit("?outcome=maybe")).res.status).toBe(400);
    expect((await listAudit("?limit=0")).res.status).toBe(400);
  });

  test("another organization sees none of these rows", async () => {
    const mine = await listAuditRows(await resolveOrganizationId(), {
      limit: 5,
    });
    expect(mine.length).toBeGreaterThan(0);
    const foreign = await listAuditRows(crypto.randomUUID(), { limit: 5 });
    expect(foreign).toHaveLength(0);
  });
});
