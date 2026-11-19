import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@ancla/db";
import { TEST_USER_AGENT } from "../../../test/support/apiCaller";
import { auditRowsOf } from "../../../test/support/auditRows";
import { createFixtures } from "../../../test/support/fixtures";
import { readMediaFixture } from "../../../test/support/media";
import { app } from "../../app";
import { getAuth } from "../../core/auth";
import { uuidV7 } from "../../core/ids";
import { getStorage, getStorageEnv } from "../../core/storage";
import { resolveOrganizationId } from "../../core/tenancy";
import { findMediaFileRow } from "./data";
import { originalKey } from "./domain";
import { purgeStaleUploads, STALE_PENDING_AFTER_MS } from "./useCases";

const fixtures = createFixtures();
const createdIds: string[] = [];
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

let organizationId = "";

beforeAll(async () => {
  organizationId = await resolveOrganizationId();
});

afterAll(async () => {
  for (const id of createdIds) {
    await getStorage("private").delete(originalKey(organizationId, id));
  }
  await db.mediaFile.deleteMany({ where: { id: { in: createdIds } } });
  await fixtures.cleanup();
});

/** A row (and its object) created `ageMs` ago, bypassing the API. */
async function seedFile(
  status: "pending" | "ready",
  ageMs: number,
): Promise<string> {
  const id = uuidV7();
  createdIds.push(id);
  const key = originalKey(organizationId, id);
  await getStorage("private").put({
    key,
    body: await readMediaFixture("document.pdf"),
    contentType: "application/pdf",
  });
  await db.mediaFile.create({
    data: {
      id,
      organizationId,
      purpose: "voucherDocument",
      status,
      key,
      contentType: "application/pdf",
      size: 69,
      originalName: `purge-${status}.pdf`,
      createdAt: new Date(Date.now() - ageMs),
    },
  });
  return id;
}

const objectExists = async (id: string) =>
  (await getStorage("private").head(originalKey(organizationId, id))) !== null;

describe("purgeStaleUploads", () => {
  test("removes old pending uploads (object, row, audit) and leaves the rest alone", async () => {
    const stale = await seedFile("pending", TWO_HOURS_MS);
    const recent = await seedFile("pending", STALE_PENDING_AFTER_MS / 4);
    const oldReady = await seedFile("ready", TWO_HOURS_MS);

    const purged = await purgeStaleUploads();
    expect(purged).toBeGreaterThanOrEqual(1);

    expect(await findMediaFileRow(organizationId, stale)).toBeNull();
    expect(await objectExists(stale)).toBe(false);
    const [row] = await auditRowsOf({ entityId: stale });
    expect(row?.action).toBe("media.purged");
    expect(row?.actorLabel).toBe("cron");
    expect(row?.actorId).toBeNull();

    expect(await findMediaFileRow(organizationId, recent)).not.toBeNull();
    expect(await objectExists(recent)).toBe(true);
    expect(await findMediaFileRow(organizationId, oldReady)).not.toBeNull();
    expect(await objectExists(oldReady)).toBe(true);
    expect(await auditRowsOf({ entityId: recent })).toEqual([]);
  });

  test("a second run has nothing left to remove from the same file", async () => {
    const stale = await seedFile("pending", TWO_HOURS_MS);
    await purgeStaleUploads();
    await purgeStaleUploads();
    expect(await auditRowsOf({ entityId: stale })).toHaveLength(1);
  });
});

describe("GET /api/internal/media/purge", () => {
  const call = (authorization?: string): Promise<Response> =>
    Promise.resolve(
      app.request("/api/internal/media/purge", {
        headers: {
          ...(authorization ? { Authorization: authorization } : {}),
          "X-Forwarded-For": fixtures.uniqueIp(),
          "User-Agent": TEST_USER_AGENT,
        },
      }),
    );
  const { CRON_SECRET } = (() => getStorageEnv())();

  test("401 without a bearer, with a wrong one, or with another scheme", async () => {
    expect((await call()).status).toBe(401);
    expect((await call("Bearer nope")).status).toBe(401);
    expect(
      (await call(`Bearer ${"x".repeat(CRON_SECRET.length)}`)).status,
    ).toBe(401);
    expect((await call(CRON_SECRET)).status).toBe(401);
    expect((await call(`Basic ${CRON_SECRET}`)).status).toBe(401);
  });

  test("a session is not enough: the cron secret is the only way in", async () => {
    const auth = getAuth();
    const email = await fixtures.passwordUser(auth, "purge-admin", ["admin"]);
    const cookie = await fixtures.signIn(auth, email);
    const res = await Promise.resolve(
      app.request("/api/internal/media/purge", {
        headers: { Cookie: cookie, "X-Forwarded-For": fixtures.uniqueIp() },
      }),
    );
    expect(res.status).toBe(401);
  });

  test("200 with the number of purged uploads for the right bearer", async () => {
    const stale = await seedFile("pending", TWO_HOURS_MS);
    const res = await call(`Bearer ${CRON_SECRET}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { purged: number };
    expect(body.purged).toBeGreaterThanOrEqual(1);
    expect(await findMediaFileRow(organizationId, stale)).toBeNull();
  });
});
