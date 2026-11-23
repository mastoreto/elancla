import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  type EditorialStatusDto,
  grant,
  PERMISSIONS,
  type SermonSnapshot,
} from "@ancla/contracts";
import { db, type MediaPurpose } from "@ancla/db";
import { createApiCaller } from "../../../../../../test/support/apiCaller";
import { createFixtures } from "../../../../../../test/support/fixtures";
import { getAuth } from "../../../../../core/auth";
import { resolveOrganizationId } from "../../../../../core/tenancy";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);
const RUN = crypto.randomUUID().slice(0, 8);

let organizationId = "";
let cookie = "";
let preacherId = "";
let notPreacherId = "";
let seriesId = "";
let foreignSeriesId = "";
let deletedSeriesId = "";
const sermonIds: string[] = [];
const mediaIds: string[] = [];
const profileIds: string[] = [];

const slugOf = (name: string): string => `test-${RUN}-${name}`;

beforeAll(async () => {
  organizationId = await resolveOrganizationId();
  const auth = getAuth();
  const email = await fixtures.passwordUser(auth, "sermon-golive", [
    grant(PERMISSIONS.sermons.view),
    grant(PERMISSIONS.sermons.create),
    grant(PERMISSIONS.sermons.edit),
    grant(PERMISSIONS.sermons.publish),
  ]);
  cookie = await fixtures.signIn(auth, email);

  const preacher = await db.personProfile.create({
    data: {
      organizationId,
      name: `Test preacher ${RUN}`,
      roles: { create: { context: "PREACHER" } },
    },
  });
  const author = await db.personProfile.create({
    data: {
      organizationId,
      name: `Test author ${RUN}`,
      roles: { create: { context: "BLOG_AUTHOR" } },
    },
  });
  preacherId = preacher.id;
  notPreacherId = author.id;
  profileIds.push(preacher.id, author.id);

  const series = (organization: string, deletedAt: Date | null = null) =>
    db.sermonSeries.create({
      data: {
        organizationId: organization,
        deletedAt,
        translations: {
          create: { locale: "es", title: "Serie", slug: slugOf("serie") },
        },
      },
    });
  seriesId = (await series(organizationId)).id;
  deletedSeriesId = (await series(organizationId, new Date())).id;
  const foreign = await fixtures.createOrganization("sermon-golive");
  foreignSeriesId = (await series(foreign.id)).id;
});

afterAll(async () => {
  // The revisions go with their author in `fixtures.cleanup()`.
  await db.sermon.deleteMany({ where: { id: { in: sermonIds } } });
  await db.sermonSeries.deleteMany({
    where: { id: { in: [seriesId, deletedSeriesId, foreignSeriesId] } },
  });
  await db.mediaFile.deleteMany({ where: { id: { in: mediaIds } } });
  await db.personProfile.deleteMany({ where: { id: { in: profileIds } } });
  await fixtures.cleanup();
});

const codeOf = async (res: Response): Promise<string> =>
  ((await res.json()) as { code: string }).code;

async function createMedia(
  purpose: MediaPurpose,
  contentType: string,
): Promise<string> {
  const id = crypto.randomUUID();
  const file = await db.mediaFile.create({
    data: {
      id,
      organizationId,
      purpose,
      status: "ready",
      key: `${organizationId}/${id}`,
      contentType,
      size: 100,
      originalName: "file",
    },
  });
  mediaIds.push(file.id);
  return file.id;
}

async function newSermon(): Promise<string> {
  const sermon = await db.sermon.create({ data: { organizationId } });
  sermonIds.push(sermon.id);
  return sermon.id;
}

const snapshotFor = (
  slug: string,
  overrides: Partial<SermonSnapshot> = {},
): Record<string, unknown> => ({
  translations: { es: { title: `Sermón ${slug}`, slug } },
  preachedOn: "2026-03-01",
  ...overrides,
});

const saveDraft = (id: string, snapshot: Record<string, unknown>) =>
  call("PUT", `/editorial/sermon/${id}/draft`, {
    cookie,
    body: { snapshot },
  });

const publish = (id: string) =>
  call("POST", `/editorial/sermon/${id}/publish`, { cookie });

/** A new sermon with the draft saved; it is then published or refused. */
async function draftOf(
  name: string,
  overrides: Partial<SermonSnapshot> = {},
): Promise<string> {
  const id = await newSermon();
  const res = await saveDraft(id, snapshotFor(slugOf(name), overrides));
  expect(res.status).toBe(200);
  return id;
}

describe("sermon editorial type", () => {
  test("a sermon without preacher, series or media goes live and fixes firstLiveAt once", async () => {
    const id = await draftOf("plain");
    const res = await publish(id);
    expect(res.status).toBe(200);
    expect(((await res.json()) as EditorialStatusDto).live).not.toBeNull();
    const first = await db.sermon.findUniqueOrThrow({ where: { id } });
    expect(first.firstLiveAt).not.toBeNull();

    await saveDraft(id, snapshotFor(slugOf("plain"), { featured: true }));
    expect((await publish(id)).status).toBe(200);
    const second = await db.sermon.findUniqueOrThrow({ where: { id } });
    expect(second.firstLiveAt).toEqual(first.firstLiveAt);
  });

  test("an id that matches no sermon is a 404", async () => {
    const res = await saveDraft(
      "01900000-0000-7000-8000-000000000000",
      snapshotFor(slugOf("ghost")),
    );
    expect(res.status).toBe(404);
  });
});

describe("sermon beforeGoLive", () => {
  test("a preacher with the role goes live; one without it is a 400 invalid_preacher", async () => {
    const good = await draftOf("preacher-ok", {
      preacherProfileId: preacherId,
    });
    expect((await publish(good)).status).toBe(200);

    const bad = await draftOf("preacher-bad", {
      preacherProfileId: notPreacherId,
    });
    const res = await publish(bad);
    expect(res.status).toBe(400);
    expect(await codeOf(res)).toBe("invalid_preacher");
  });

  test("a series of the organization goes live; a foreign or deleted one is a 400 invalid_series", async () => {
    const good = await draftOf("series-ok", { seriesId, seriesOrder: 1 });
    expect((await publish(good)).status).toBe(200);

    for (const wrong of [foreignSeriesId, deletedSeriesId]) {
      const id = await draftOf(`series-bad-${wrong.slice(0, 6)}`, {
        seriesId: wrong,
        seriesOrder: 1,
      });
      const res = await publish(id);
      expect(res.status).toBe(400);
      expect(await codeOf(res)).toBe("invalid_series");
    }
  });

  test("a slug another live sermon uses is a 409 slug_taken", async () => {
    const first = await draftOf("taken");
    expect((await publish(first)).status).toBe(200);

    const second = await newSermon();
    await saveDraft(second, snapshotFor(slugOf("taken")));
    const res = await publish(second);
    expect(res.status).toBe(409);
    expect(await codeOf(res)).toBe("slug_taken");
  });

  test("the slug of a published language cannot change (409 slug_locked)", async () => {
    const id = await draftOf("locked");
    expect((await publish(id)).status).toBe(200);

    await saveDraft(id, snapshotFor(slugOf("locked-renamed")));
    const res = await publish(id);
    expect(res.status).toBe(409);
    expect(await codeOf(res)).toBe("slug_locked");
  });

  test("attachments must be public PDFs: a file with another purpose is a 400 invalid_media", async () => {
    const pdf = await createMedia("contentDocument", "application/pdf");
    const privatePdf = await createMedia("voucherDocument", "application/pdf");
    const image = await createMedia("contentImage", "image/png");

    const good = await draftOf("media-ok", {
      attachmentMediaIds: [pdf],
      coverMediaId: image,
    });
    expect((await publish(good)).status).toBe(200);

    for (const [name, overrides] of [
      ["attachment-private", { attachmentMediaIds: [privatePdf] }],
      ["attachment-image", { attachmentMediaIds: [image] }],
      ["cover-pdf", { coverMediaId: pdf }],
    ] as const) {
      const id = await draftOf(name, overrides);
      const res = await publish(id);
      expect(res.status).toBe(400);
      expect(await codeOf(res)).toBe("invalid_media");
    }
  });
});
