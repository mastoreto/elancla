import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@ancla/db";
import { createApiCaller } from "../../../test/support/apiCaller";
import {
  type BlogWorld,
  createBlogWorld,
} from "../../../test/support/blogWorld";
import { createFixtures } from "../../../test/support/fixtures";
import { getStorageEnv } from "../../core/storage";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

const BROWSER = "Mozilla/5.0 (X11; Linux x86_64) Firefox/130.0";
const OTHER_BROWSER = "Mozilla/5.0 (Macintosh) Safari/605.1";
const VISITOR_IP = "198.51.100.23";
const DAY_MS = 86_400_000;

let world: BlogWorld;
const ids: Record<string, string> = {};

const view = (
  slug: string,
  visitor: { ip: string; userAgent: string },
  forwardedFor?: string,
) =>
  call("POST", `/public/v1/${world.slug}/posts/${slug}/views`, {
    headers: {
      Authorization: `Bearer ${world.key}`,
      ...(forwardedFor ? { "X-Forwarded-For": forwardedFor } : {}),
    },
    body: visitor,
  });

/** The counted views of a post today, and how many visitor hashes are stored for it. */
async function countersOf(postId: string) {
  const { date } = world.today();
  const daily = await db.postViewDaily.findUnique({
    where: { postId_day: { postId, day: date } },
  });
  const visitors = await db.postViewVisitor.count({ where: { postId } });
  return { count: daily?.count ?? 0, visitors };
}

beforeAll(async () => {
  world = await createBlogWorld(fixtures);
  ids.live = await world.createPost({
    slugs: { es: "visible" },
    categoryId: world.categoryA,
    firstLiveAt: new Date("2026-03-10T15:00:00Z"),
  });
  ids.draft = await world.createPost({
    slugs: { es: "borrador" },
    categoryId: world.categoryA,
    firstLiveAt: null,
    state: "DRAFT",
  });
  ids.paused = await world.createPost({
    slugs: { es: "pausado" },
    categoryId: world.categoryA,
    firstLiveAt: new Date("2026-02-01T15:00:00Z"),
    state: "PAUSED",
  });
  const soon = world.daysFromNow(3);
  ids.scheduled = await world.createPost({
    slugs: { es: "pronto" },
    categoryId: world.categoryA,
    firstLiveAt: soon,
    publishAt: soon.toISOString(),
  });
});

afterAll(async () => {
  await fixtures.cleanup();
});

describe("POST /public/v1/:churchSlug/posts/:slug/views", () => {
  test("the same visitor twice in a day counts once; another user agent counts again", async () => {
    const first = await view("visible", { ip: VISITOR_IP, userAgent: BROWSER });
    expect(first.status).toBe(204);
    expect(await first.text()).toBe("");
    expect(
      (await view("visible", { ip: VISITOR_IP, userAgent: BROWSER })).status,
    ).toBe(204);
    expect(await countersOf(ids.live as string)).toEqual({
      count: 1,
      visitors: 1,
    });

    expect(
      (await view("visible", { ip: VISITOR_IP, userAgent: OTHER_BROWSER }))
        .status,
    ).toBe(204);
    expect(await countersOf(ids.live as string)).toEqual({
      count: 2,
      visitors: 2,
    });
  });

  test("bots and an empty user agent are not counted, and still get 204", async () => {
    const before = await countersOf(ids.live as string);
    for (const userAgent of [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "",
      "   ",
    ]) {
      const res = await view("visible", { ip: "198.51.100.77", userAgent });
      expect(res.status, userAgent).toBe(204);
    }
    expect(await countersOf(ids.live as string)).toEqual(before);
  });

  test("drafts, paused, scheduled and unknown posts count nothing and answer 204", async () => {
    for (const slug of ["borrador", "pausado", "pronto", "no-existe"]) {
      const res = await view(slug, { ip: "198.51.100.88", userAgent: BROWSER });
      expect(res.status, slug).toBe(204);
    }
    for (const key of ["draft", "paused", "scheduled"]) {
      expect(await countersOf(ids[key] as string), key).toEqual({
        count: 0,
        visitors: 0,
      });
    }
  });

  test("the database keeps neither the IP nor the user agent", async () => {
    const ip = "198.51.100.99";
    const userAgent = `${BROWSER} unique-marker`;
    await view("visible", { ip, userAgent });
    const visitors = await db.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM post_view_visitors WHERE "postId" = ${ids.live}::uuid`;
    const daily = await db.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM post_views_daily WHERE "postId" = ${ids.live}::uuid`;
    expect(Object.keys(visitors[0] ?? {}).sort()).toEqual([
      "day",
      "postId",
      "visitorHash",
    ]);
    expect(Object.keys(daily[0] ?? {}).sort()).toEqual([
      "count",
      "day",
      "postId",
    ]);
    for (const row of visitors) {
      expect(row.visitorHash).toMatch(/^[0-9a-f]{64}$/);
    }
    const stored = JSON.stringify([visitors, daily]);
    expect(stored).not.toContain(ip);
    expect(stored).not.toContain("unique-marker");
  });

  test("a view clears the visitors of earlier days of that post", async () => {
    const { date } = world.today();
    const yesterday = new Date(date.getTime() - DAY_MS);
    await db.postViewVisitor.create({
      data: { postId: ids.live as string, day: yesterday, visitorHash: "old" },
    });
    await view("visible", { ip: "198.51.100.101", userAgent: BROWSER });
    const old = await db.postViewVisitor.count({
      where: { postId: ids.live as string, day: { lt: date } },
    });
    expect(old).toBe(0);
  });

  test("an invalid body is a 400; no site key is a 401", async () => {
    const bad = await call(
      "POST",
      `/public/v1/${world.slug}/posts/visible/views`,
      {
        headers: { Authorization: `Bearer ${world.key}` },
        body: { ip: "", userAgent: BROWSER },
      },
    );
    expect(bad.status).toBe(400);
    const anonymous = await call(
      "POST",
      `/public/v1/${world.slug}/posts/visible/views`,
      { body: { ip: VISITOR_IP, userAgent: BROWSER } },
    );
    expect(anonymous.status).toBe(401);
  });

  test("an address that floods the endpoint is limited (429), per forwarded address", async () => {
    const flooder = fixtures.uniqueIp();
    const visitor = { ip: VISITOR_IP, userAgent: BROWSER };
    const statuses: number[] = [];
    for (let i = 0; i < 31; i += 1) {
      statuses.push((await view("visible", visitor, flooder)).status);
    }
    expect(statuses.slice(0, 30).every((status) => status === 204)).toBe(true);
    expect(statuses[30]).toBe(429);
    expect((await view("visible", visitor)).status).toBe(204);
  });
});

describe("GET /internal/blog/views/purge", () => {
  const purge = (secret?: string) =>
    call("GET", "/internal/blog/views/purge", {
      headers: secret ? { Authorization: `Bearer ${secret}` } : undefined,
    });

  test("without the cron secret it is a 401", async () => {
    expect((await purge()).status).toBe(401);
    expect((await purge("wrong")).status).toBe(401);
  });

  test("deletes the visitors of past days and keeps today's", async () => {
    const postId = ids.live as string;
    const { date } = world.today();
    await db.postViewVisitor.deleteMany({ where: { postId } });
    await db.postViewVisitor.createMany({
      data: [
        {
          postId,
          day: new Date(date.getTime() - 2 * DAY_MS),
          visitorHash: "a",
        },
        { postId, day: new Date(date.getTime() - DAY_MS), visitorHash: "b" },
        { postId, day: date, visitorHash: "c" },
      ],
    });
    const res = await purge(getStorageEnv().CRON_SECRET);
    expect(res.status).toBe(200);
    const { purged } = (await res.json()) as { purged: number };
    expect(purged).toBeGreaterThanOrEqual(2);
    const left = await db.postViewVisitor.findMany({ where: { postId } });
    expect(left.map((row) => row.visitorHash)).toEqual(["c"]);
  });
});
