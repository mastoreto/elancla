import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { grant, PERMISSIONS } from "@ancla/contracts";
import { db } from "@ancla/db";
import {
  cookieHeaderFrom,
  createFixtures,
  TEST_PASSWORD,
} from "../../../../test/support/fixtures";
import { createRecordingMailer } from "../../../../test/support/recordingMailer";
import { app } from "../../../app";
import { getAuth } from "../../../core/auth";
import { getApiEnv } from "../../../core/env";
import { setMailerForTests } from "../../../core/mail";
import { hashInvitationToken } from "./domain";

const fixtures = createFixtures();
const mailer = createRecordingMailer();
const { CRM_ORIGIN } = getApiEnv();

let adminCookie = "";
let viewerCookie = "";
let inviterCookie = "";
let adminRoleId = "";

beforeAll(async () => {
  setMailerForTests(mailer);
  const auth = getAuth();
  adminRoleId = await fixtures.roleIdByKey("admin");
  adminCookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, "inv-admin", ["admin"]),
  );
  // Can invite but is not an admin.
  inviterCookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, "inv-inviter", [
      grant(PERMISSIONS.invitations.create),
    ]),
  );
  // A signed-in user whose roles grant nothing.
  viewerCookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, "inv-viewer"),
  );
});

afterAll(async () => {
  setMailerForTests(undefined);
  await fixtures.cleanup();
});

function call(
  method: string,
  path: string,
  options: { cookie?: string; body?: unknown; ip?: string } = {},
) {
  return app.request(`/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Origin: CRM_ORIGIN,
      ...(options.cookie ? { Cookie: options.cookie } : {}),
      // Every call gets its own address so the public endpoints' rate limits never leak between tests.
      "X-Forwarded-For": options.ip ?? fixtures.uniqueIp(),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

/** The plain token as the invitee finds it: inside the emailed link. */
function tokenFromLastEmail(to: string): string {
  const message = [...mailer.sent].reverse().find((sent) => sent.to === to);
  const token = message?.text.match(/\/invitation\/([A-Za-z0-9_-]{43})/)?.[1];
  if (!token) throw new Error("No invitation link in the email");
  return token;
}

describe("admin endpoints", () => {
  test("without a session is a 401, a non-admin gets a 403", async () => {
    const body = {
      email: fixtures.uniqueEmail("nope"),
      roleIds: [adminRoleId],
    };
    expect((await call("POST", "/invitations", { body })).status).toBe(401);
    expect(
      (await call("POST", "/invitations", { body, cookie: viewerCookie }))
        .status,
    ).toBe(403);
    expect(
      (await call("GET", "/invitations", { cookie: viewerCookie })).status,
    ).toBe(403);
  });

  test("create emails a link, stores only the hash and lists the invitation", async () => {
    const email = fixtures.uniqueEmail("created");
    const res = await call("POST", "/invitations", {
      body: { email, roleIds: [adminRoleId] },
      cookie: adminCookie,
    });
    expect(res.status).toBe(201);
    const dto = await res.json();
    expect(dto).toMatchObject({
      email,
      roleIds: [adminRoleId],
      ministryIds: [],
      status: "pending",
    });
    expect(Object.keys(dto).sort()).toEqual([
      "createdAt",
      "email",
      "expiresAt",
      "id",
      "ministryIds",
      "roleIds",
      "status",
    ]);

    const token = tokenFromLastEmail(email);
    const row = await db.invitation.findUniqueOrThrow({
      where: { id: dto.id },
    });
    expect(row.tokenHash).toBe(hashInvitationToken(token));
    expect(row.tokenHash).not.toBe(token);
    expect(JSON.stringify(row)).not.toContain(token);
    expect(row.invitedById).not.toBeNull();

    const list = await (
      await call("GET", "/invitations?limit=100", { cookie: adminCookie })
    ).json();
    expect(list.items.some((item: { id: string }) => item.id === dto.id)).toBe(
      true,
    );
    expect(JSON.stringify(list)).not.toContain(row.tokenHash);
  });

  test("only an admin can invite with the admin role (no escalation through invitations:create)", async () => {
    const email = fixtures.uniqueEmail("escalation");
    const res = await call("POST", "/invitations", {
      body: { email, roleIds: [adminRoleId] },
      cookie: inviterCookie,
    });
    expect(res.status).toBe(403);
    expect(await db.invitation.count({ where: { email } })).toBe(0);

    // The leader role grants permissions the inviter does not hold.
    const leaderId = await fixtures.roleIdByKey("leader");
    const tooWide = await call("POST", "/invitations", {
      body: { email, roleIds: [leaderId] },
      cookie: inviterCookie,
    });
    expect(tooWide.status).toBe(403);

    // A role the inviter fully covers (here, one that grants nothing) is fine.
    const harmlessId = await fixtures.createRole("harmless");
    const allowed = await call("POST", "/invitations", {
      body: { email, roleIds: [harmlessId] },
      cookie: inviterCookie,
    });
    expect(allowed.status).toBe(201);
  });

  test("an invitation with an unknown role or ministry is a 400", async () => {
    const unknown = crypto.randomUUID();
    for (const body of [
      { roleIds: [unknown] },
      { roleIds: [adminRoleId], ministryIds: [unknown] },
    ]) {
      const res = await call("POST", "/invitations", {
        body: { email: fixtures.uniqueEmail("unknown-ids"), ...body },
        cookie: adminCookie,
      });
      expect(res.status).toBe(400);
    }
  });

  test("an invitation needs at least one role", async () => {
    const res = await call("POST", "/invitations", {
      body: { email: fixtures.uniqueEmail("no-role"), roleIds: [] },
      cookie: adminCookie,
    });
    expect(res.status).toBe(400);
  });

  test("an address with a pending invitation or an account is a 409", async () => {
    const email = fixtures.uniqueEmail("dup");
    const first = await call("POST", "/invitations", {
      body: { email, roleIds: [adminRoleId] },
      cookie: adminCookie,
    });
    expect(first.status).toBe(201);
    expect(
      (
        await call("POST", "/invitations", {
          body: { email, roleIds: [adminRoleId] },
          cookie: adminCookie,
        })
      ).status,
    ).toBe(409);

    const existing = await fixtures.passwordUser(getAuth(), "has-account");
    expect(
      (
        await call("POST", "/invitations", {
          body: { email: existing, roleIds: [adminRoleId] },
          cookie: adminCookie,
        })
      ).status,
    ).toBe(409);
  });

  test("revoke kills the link; resend rotates it and mails the new one", async () => {
    const email = fixtures.uniqueEmail("revoke-resend");
    const created = await (
      await call("POST", "/invitations", {
        body: { email, roleIds: [adminRoleId] },
        cookie: adminCookie,
      })
    ).json();
    const oldToken = tokenFromLastEmail(email);

    const resent = await call("POST", `/invitations/${created.id}/resend`, {
      cookie: adminCookie,
    });
    expect(resent.status).toBe(200);
    const newToken = tokenFromLastEmail(email);
    expect(newToken).not.toBe(oldToken);
    expect(
      (await call("GET", `/invitations/by-token/${oldToken}`)).status,
    ).toBe(404);
    expect(
      (await call("GET", `/invitations/by-token/${newToken}`)).status,
    ).toBe(200);

    const revoked = await call("POST", `/invitations/${created.id}/revoke`, {
      cookie: adminCookie,
    });
    expect((await revoked.json()).status).toBe("revoked");
    expect(
      (await call("GET", `/invitations/by-token/${newToken}`)).status,
    ).toBe(404);
    expect(
      (
        await call("POST", `/invitations/${created.id}/resend`, {
          cookie: adminCookie,
        })
      ).status,
    ).toBe(409);
  });
});

describe("public endpoints", () => {
  test("preview shows a masked email, the organization and the validity", async () => {
    const email = fixtures.uniqueEmail("preview");
    const token = await fixtures.invite(email);
    const res = await call("GET", `/invitations/by-token/${token}`, {
      ip: fixtures.uniqueIp(),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Object.keys(body).sort()).toEqual([
      "expiresAt",
      "maskedEmail",
      "organizationName",
    ]);
    expect(body.maskedEmail).not.toContain(email.split("@")[0] as string);
    expect(body.maskedEmail).toContain("***");
  });

  test("an unknown, used, expired or revoked token fail identically", async () => {
    const used = await fixtures.invite(fixtures.uniqueEmail("used"), {
      acceptedAt: new Date(),
    });
    const expired = await fixtures.invite(fixtures.uniqueEmail("expired"), {
      expiresAt: new Date(Date.now() - 1000),
    });
    const revoked = await fixtures.invite(fixtures.uniqueEmail("revoked"), {
      revokedAt: new Date(),
    });
    const unknown = "x".repeat(43);
    const ip = fixtures.uniqueIp();

    const bodies = new Set<string>();
    for (const token of [used, expired, revoked, unknown]) {
      for (const [method, suffix, body] of [
        ["GET", "", undefined],
        ["POST", "/accept", { name: "Someone", password: TEST_PASSWORD }],
      ] as const) {
        const res = await call(
          method,
          `/invitations/by-token/${token}${suffix}`,
          { body, ip },
        );
        expect(res.status).toBe(404);
        const problem = await res.json();
        bodies.add(JSON.stringify({ ...problem, requestId: undefined }));
      }
    }
    expect(bodies.size).toBe(1);
  });

  test("accept creates a verified user with the invited role and consumes the invitation", async () => {
    const email = fixtures.uniqueEmail("accept");
    const ministryId = await fixtures.createMinistry("accept");
    const token = await fixtures.invite(email, {
      roleIds: [adminRoleId],
      ministryIds: [ministryId],
    });
    const ip = fixtures.uniqueIp();

    const weak = await call("POST", `/invitations/by-token/${token}/accept`, {
      body: { name: "Ana", password: "short" },
      ip,
    });
    expect(weak.status).toBe(400);

    const res = await call("POST", `/invitations/by-token/${token}/accept`, {
      body: { name: "Ana", password: TEST_PASSWORD },
      ip,
    });
    expect(res.status).toBe(204);
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    expect(user).toMatchObject({ name: "Ana", emailVerified: true });
    const roles = await db.userRole.findMany({ where: { userId: user.id } });
    expect(roles.map((row) => row.roleId)).toEqual([adminRoleId]);
    const ministries = await db.userMinistry.findMany({
      where: { userId: user.id },
    });
    expect(ministries.map((row) => row.ministryId)).toEqual([ministryId]);
    const invitation = await db.invitation.findFirstOrThrow({
      where: { email },
    });
    expect(invitation.acceptedAt).not.toBeNull();

    // Single use.
    const again = await call("POST", `/invitations/by-token/${token}/accept`, {
      body: { name: "Ana", password: TEST_PASSWORD },
      ip,
    });
    expect(again.status).toBe(404);

    const signIn = await call("POST", "/auth/sign-in/email", {
      body: { email, password: TEST_PASSWORD },
      ip: fixtures.uniqueIp(),
    });
    expect(signIn.status).toBe(200);
    expect(cookieHeaderFrom(signIn.headers)).toContain("session_token");
  });

  test("the public endpoints are rate limited", async () => {
    const ip = fixtures.uniqueIp();
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const res = await call(
        "POST",
        `/invitations/by-token/${"y".repeat(43)}/accept`,
        {
          body: { name: "Ana", password: TEST_PASSWORD },
          ip,
        },
      );
      statuses.push(res.status);
    }
    expect(statuses.slice(0, 10).every((status) => status === 404)).toBe(true);
    expect(statuses.slice(10)).toEqual([429, 429]);
  });
});
