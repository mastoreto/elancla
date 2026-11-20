import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  type CreatedSiteKeyDto,
  grant,
  PERMISSIONS,
  type SiteKeyDto,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { createApiCaller } from "../../../test/support/apiCaller";
import { auditRowsOf, requestIdOf } from "../../../test/support/auditRows";
import { createFixtures } from "../../../test/support/fixtures";
import { getAuth } from "../../core/auth";
import { resolveOrganizationId } from "../../core/tenancy";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);
const UNKNOWN_ID = "01900000-0000-7000-8000-000000000000";

let organizationId = "";
let slug = "";
let cookie = "";

afterAll(() => fixtures.cleanup());

async function revokeEveryActiveKey(): Promise<void> {
  await db.siteApiKey.updateMany({
    where: { organizationId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

beforeAll(async () => {
  organizationId = await resolveOrganizationId();
  slug = (
    await db.organization.findUniqueOrThrow({
      where: { id: organizationId },
      select: { slug: true },
    })
  ).slug;
  const auth = getAuth();
  cookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, "site-keys", [
      grant(PERMISSIONS.siteKeys.view),
      grant(PERMISSIONS.siteKeys.create),
      grant(PERMISSIONS.siteKeys.delete),
    ]),
  );
  // The limit counts active keys of the whole organization: start from none.
  await revokeEveryActiveKey();
});

async function createKey(name: string): Promise<Response> {
  const res = await call("POST", "/site-keys", { cookie, body: { name } });
  if (res.status === 201) {
    fixtures.trackSiteKey(((await res.clone().json()) as SiteKeyDto).id);
  }
  return res;
}

describe("site keys", () => {
  test("POST returns the key once, GET never does", async () => {
    const res = await createKey("web");
    expect(res.status).toBe(201);
    const created = (await res.json()) as CreatedSiteKeyDto;
    expect(created.key).toStartWith(`sk_${created.id}_`);
    expect(created.hint).toBe(`sk_${created.id.slice(0, 8)}…`);

    const list = await call("GET", "/site-keys", { cookie });
    expect(list.status).toBe(200);
    const text = await list.text();
    expect(text).toContain(created.id);
    expect(text).not.toContain(created.key);
    expect(text).not.toContain("secretHash");
    expect(text).not.toContain('"key"');

    const stored = await db.siteApiKey.findUniqueOrThrow({
      where: { id: created.id },
    });
    expect(stored.secretHash).not.toContain(created.key);
    expect(created.key).not.toContain(stored.secretHash);
  });

  test("a created key authenticates against the public API", async () => {
    await revokeEveryActiveKey();
    const created = (await (
      await createKey("works")
    ).json()) as CreatedSiteKeyDto;
    const res = await call("GET", `/public/v1/${slug}/settings`, {
      headers: { Authorization: `Bearer ${created.key}` },
    });
    expect(res.status).toBe(200);
  });

  test("the third active key is a 409 site_key_limit", async () => {
    await revokeEveryActiveKey();
    expect((await createKey("one")).status).toBe(201);
    expect((await createKey("two")).status).toBe(201);
    const third = await createKey("three");
    expect(third.status).toBe(409);
    expect(((await third.json()) as { code: string }).code).toBe(
      "site_key_limit",
    );
  });

  test("GET lists active keys before newer revoked ones", async () => {
    await revokeEveryActiveKey();
    const older = (await (
      await createKey("older-active")
    ).json()) as CreatedSiteKeyDto;
    const newer = (await (
      await createKey("newer-revoked")
    ).json()) as CreatedSiteKeyDto;
    await call("DELETE", `/site-keys/${newer.id}`, { cookie });

    const list = (await (
      await call("GET", "/site-keys", { cookie })
    ).json()) as SiteKeyDto[];
    expect(list[0]?.id).toBe(older.id);
    // Then the revoked ones, most recent revocation first.
    expect(list.find((key) => key.revokedAt !== null)?.id).toBe(newer.id);
  });

  test("DELETE revokes: the key stops authenticating and the audit keeps the request id", async () => {
    await revokeEveryActiveKey();
    const created = (await (
      await createKey("to-revoke")
    ).json()) as CreatedSiteKeyDto;
    const publicCall = (): Promise<Response> =>
      call("GET", `/public/v1/${slug}/settings`, {
        headers: { Authorization: `Bearer ${created.key}` },
      });
    expect((await publicCall()).status).toBe(200);

    const res = await call("DELETE", `/site-keys/${created.id}`, { cookie });
    expect(res.status).toBe(204);
    expect((await publicCall()).status).toBe(401);

    const rows = await auditRowsOf({
      requestId: requestIdOf(res),
      action: "siteApiKey.revoked",
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.entityId).toBe(created.id);
    expect(JSON.stringify(rows[0])).not.toContain(created.key);

    // The row stays (soft revoke) and revoking again is a 404.
    const stored = await db.siteApiKey.findUniqueOrThrow({
      where: { id: created.id },
    });
    expect(stored.revokedAt).not.toBeNull();
    const again = await call("DELETE", `/site-keys/${created.id}`, { cookie });
    expect(again.status).toBe(404);
  });

  test("creating a key is audited without the secret", async () => {
    await revokeEveryActiveKey();
    const res = await createKey("audited");
    const created = (await res.json()) as CreatedSiteKeyDto;
    const rows = await auditRowsOf({
      requestId: requestIdOf(res),
      action: "siteApiKey.created",
    });
    expect(rows).toHaveLength(1);
    const serialized = JSON.stringify(rows[0]);
    expect(serialized).toContain(created.id);
    expect(serialized).not.toContain(created.key);
    expect(serialized).not.toContain(secretOf(created));
  });

  test("a key of another organization is a 404", async () => {
    const other = await fixtures.createOrganization("foreign-keys");
    const foreign = await fixtures.createSiteKey(other.id);
    const res = await call("DELETE", `/site-keys/${foreign.id}`, { cookie });
    expect(res.status).toBe(404);
    const unknown = await call("DELETE", `/site-keys/${UNKNOWN_ID}`, {
      cookie,
    });
    expect(unknown.status).toBe(404);
  });

  test("a name that is empty is a 400", async () => {
    const res = await call("POST", "/site-keys", {
      cookie,
      body: { name: "   " },
    });
    expect(res.status).toBe(400);
  });
});

/** The secret part of a created key, to prove the audit row does not carry it. */
function secretOf(created: CreatedSiteKeyDto): string {
  return created.key.slice(`sk_${created.id}_`.length);
}
