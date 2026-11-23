import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { ADMIN_ROLE_KEY, type PublicSermonIndexDto } from "@ancla/contracts";
import { createDbClient, db } from "@ancla/db";
import { createApiCaller } from "../../../../test/support/apiCaller";
import { auditRowsOf } from "../../../../test/support/auditRows";
import { createFixtures } from "../../../../test/support/fixtures";
import {
  createRecordedYoutubeFetch,
  RECORDED_YOUTUBE_API_KEY,
} from "../../../../test/support/recordedYoutubeFetch";
import { getAuth } from "../../../core/auth";
import { createYoutubePlatform } from "../../../core/platforms";
import { VIDEO_PLATFORM_CONTRACT_IDS as IDS } from "../../../core/platforms/videoPlatformContract";
import { listLiveSnapshots } from "../../../modules/editorial";
import {
  IMPORT_ACTOR_LABEL,
  runYoutubeSermonImport,
} from "./runYoutubeSermonImport";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

const [, HEBREOS_PLAYLIST, NAVIDAD_PLAYLIST] = IDS.channelPlaylistIds;
const [FIRST_VIDEO, SECOND_VIDEO, THIRD_VIDEO, FOURTH_VIDEO] =
  IDS.playlistVideoIds;

let organizationId = "";
let slug = "";
let siteKey = "";

const platform = () =>
  createYoutubePlatform({
    apiKey: RECORDED_YOUTUBE_API_KEY,
    fetch: createRecordedYoutubeFetch(),
  });

const runImport = (dryRun: boolean) =>
  runYoutubeSermonImport({
    organizationSlug: slug,
    playlist: IDS.playlistId,
    dryRun,
    platform: platform(),
  });

const counts = async () => ({
  sermons: await db.sermon.count({ where: { organizationId } }),
  links: await db.platformLink.count({ where: { organizationId } }),
  series: await db.sermonSeries.count({ where: { organizationId } }),
  revisions: await db.contentRevision.count({ where: { organizationId } }),
  audit: await db.auditLog.count({ where: { organizationId } }),
});

beforeAll(async () => {
  const organization = await fixtures.createOrganization("sermon-import");
  organizationId = organization.id;
  slug = organization.slug;
  siteKey = (await fixtures.createSiteKey(organizationId)).key;
  const email = await fixtures.passwordUser(getAuth(), "sermon-import-admin");
  const user = await db.user.findUniqueOrThrow({ where: { email } });
  const role = await db.role.create({
    data: { organizationId, key: ADMIN_ROLE_KEY, name: "Admin" },
  });
  await db.userRole.create({ data: { userId: user.id, roleId: role.id } });
});

afterAll(async () => {
  await db.platformLink.deleteMany({ where: { organizationId } });
  await db.sermonSeries.deleteMany({ where: { organizationId } });
  await db.sermon.deleteMany({ where: { organizationId } });
  // The audit trail and the revisions cannot be deleted by the runtime role.
  const owner = createDbClient(process.env.DATABASE_MIGRATION_URL as string);
  try {
    await owner.auditLog.deleteMany({ where: { organizationId } });
  } finally {
    await owner.$disconnect();
  }
  await fixtures.cleanup();
});

describe("importYoutubeSermons", () => {
  test("refuses an unknown organization and one without a YouTube channel", async () => {
    await expect(
      runYoutubeSermonImport({
        organizationSlug: "no-such-church",
        playlist: IDS.playlistId,
        dryRun: true,
        platform: platform(),
      }),
    ).rejects.toThrow('There is no organization "no-such-church"');
    await expect(runImport(true)).rejects.toThrow(
      "no YouTube channel configured",
    );
    await db.siteSettings.create({
      data: {
        organizationId,
        name: "Import test",
        url: "https://import.test",
        youtubeChannelId: IDS.offlineChannelId,
      },
    });
  });

  test("a dry run reports what it would import and writes nothing", async () => {
    const before = await counts();
    const report = await runImport(true);

    expect(report.dryRun).toBe(true);
    expect(report.playlistTitle).toBe("Firmes en la tormenta");
    expect(report.sermonsImported.map((sermon) => sermon.videoId)).toEqual([
      ...IDS.playlistVideoIds,
    ]);
    expect(report.seriesCreated.map((series) => series.title)).toEqual([
      "Estudio de Hebreos",
      "Navidad 2025",
    ]);
    expect(report.sermonsSkipped).toEqual([]);
    expect(await counts()).toEqual(before);
    expect(before).toEqual({
      sermons: 0,
      links: 0,
      series: 0,
      revisions: 0,
      audit: 0,
    });
  });

  test("imports the sermons as published, with the minimum, and links the series", async () => {
    const report = await runImport(false);
    expect(report.sermonsImported).toHaveLength(4);
    expect(report.seriesCreated).toHaveLength(2);

    expect(await counts()).toEqual({
      sermons: 4,
      links: 4,
      series: 2,
      revisions: 4,
      audit: 4 + 4 + 2,
    });

    const series = await db.sermonSeries.findMany({
      where: { organizationId },
      include: { translations: true },
    });
    const byPlaylist = new Map(
      series.map((row) => [row.youtubePlaylistId, row]),
    );
    expect(byPlaylist.get(HEBREOS_PLAYLIST)?.translations).toMatchObject([
      { locale: "es", title: "Estudio de Hebreos", slug: "estudio-de-hebreos" },
    ]);
    expect(byPlaylist.has(IDS.playlistId)).toBe(false);

    const live = await listLiveSnapshots(organizationId, "SERMON");
    expect(live).toHaveLength(4);
    const placement = new Map(
      await Promise.all(
        live.map(async ({ entityId, snapshot }) => {
          const link = await db.platformLink.findFirstOrThrow({
            where: { entityId },
          });
          return [link.externalId, snapshot] as const;
        }),
      ),
    );
    expect(placement.get(FIRST_VIDEO)).toMatchObject({
      seriesId: byPlaylist.get(HEBREOS_PLAYLIST)?.id,
      seriesOrder: 1,
      preachedOn: "2026-11-15",
    });
    expect(placement.get(SECOND_VIDEO)).toMatchObject({
      seriesId: byPlaylist.get(HEBREOS_PLAYLIST)?.id,
      seriesOrder: 2,
    });
    expect(placement.get(FOURTH_VIDEO)).toMatchObject({
      seriesId: byPlaylist.get(NAVIDAD_PLAYLIST)?.id,
      seriesOrder: 1,
    });
    const unplaced = placement.get(THIRD_VIDEO);
    expect(unplaced?.seriesId).toBeUndefined();
    expect(unplaced?.preacherProfileId).toBeUndefined();
    expect(unplaced?.translations).toEqual({
      es: {
        title: "Ancla en Cristo | Serie Firmes en la tormenta",
        slug: "ancla-en-cristo-serie-firmes-en-la-tormenta",
        tags: [],
      },
    });

    const link = await db.platformLink.findFirstOrThrow({
      where: { organizationId, externalId: FIRST_VIDEO },
    });
    expect(link).toMatchObject({
      entityType: "SERMON",
      platform: "YOUTUBE",
      durationSeconds: 3723,
      viewCount: 1523,
    });
  });

  test("the imported sermons are in the public API", async () => {
    const res = await call("GET", `/public/v1/${slug}/sermons`, {
      headers: { Authorization: `Bearer ${siteKey}` },
    });
    expect(res.status).toBe(200);
    const index = (await res.json()) as PublicSermonIndexDto;
    expect(index.sermons).toHaveLength(4);
    expect(index.series.map((series) => series.title).sort()).toEqual([
      "Estudio de Hebreos",
      "Navidad 2025",
    ]);
  });

  test("audits each sermon as imported by the system", async () => {
    const imported = await db.auditLog.findMany({
      where: { organizationId, action: "sermon.imported" },
    });
    expect(imported).toHaveLength(4);
    for (const row of imported) {
      expect(row.actorId).toBeNull();
      expect(row.actorLabel).toBe(IMPORT_ACTOR_LABEL);
      expect(row.entityType).toBe("sermon");
    }
    const seriesRows = await auditRowsOf({ actorLabel: IMPORT_ACTOR_LABEL });
    expect(
      seriesRows.filter((row) => row.action === "sermonSeries.imported"),
    ).toHaveLength(2);
  });

  test("a second run skips what is already linked and creates nothing", async () => {
    const before = await counts();
    const report = await runImport(false);

    expect(report.sermonsImported).toEqual([]);
    expect(report.seriesCreated).toEqual([]);
    expect(report.seriesReused).toHaveLength(2);
    expect(report.sermonsSkipped).toEqual(
      IDS.playlistVideoIds.map((videoId) => ({
        videoId,
        reason: "already_linked",
      })),
    );
    expect(await counts()).toEqual(before);
  });
});
