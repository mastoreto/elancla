import {
  ADMIN_ROLE_KEY,
  AUDIT_ACTIONS,
  SERMON_SERIES_TITLE_MAX_LENGTH,
  type SermonSnapshot,
} from "@ancla/contracts";

import { db, type Prisma } from "@ancla/db";
import { auditSourceForSystem, writeAudit } from "../../../core/audit";
import type { AuthenticatedContext, SessionUser } from "../../../core/context";
import { withTransaction } from "../../../core/db";
import {
  type ChannelPlaylistSummary,
  MAX_LISTED_ITEMS,
  MAX_VIDEOS_PER_BATCH,
  type VideoInfo,
  type VideoPlatform,
} from "../../../core/platforms";
import {
  createDraftRevision,
  EDITORIAL_TYPES,
  goLiveWorkingRevision,
  isUniqueViolation,
  listCurrentRevisionRows,
  nextRevisionNumber,
} from "../../../modules/editorial";
import {
  buildSermonDraft,
  createSeriesRow,
  createSermonLinkRow,
  createSermonRow,
  findLinkedVideoIds,
  findOrganizationSermonConfig,
  findSeriesIdByPlaylist,
  findYoutubeChannelId,
  listSeriesSlugs,
  nextSeriesOrder,
  pickFreeSlug,
  slugifyTitle,
  toPlatformLinkFields,
  truncateText,
  youtubeWatchUrl,
} from "../../../modules/sermons";
import type {
  ImportedSeries,
  ImportedSermon,
  SermonImportOptions,
  SermonImportReport,
  SkippedVideo,
} from "../types";
import {
  assignSeriesPlaylists,
  type SeriesPlacement,
} from "../utils/assignSeriesPlaylists";

/** Who the audit trail says did it. */
export const IMPORT_ACTOR_LABEL = "import:sermons";
const SERIES_SLUG_FALLBACK = "series";

interface Organization {
  id: string;
  defaultLocale: string;
  timezone: string;
  channelId: string;
}

interface SeriesPlaylistState extends ImportedSeries {
  /** `null` while the series does not exist (a dry run never creates it). */
  seriesId: string | null;
}

async function loadOrganization(slug: string): Promise<Organization> {
  const organization = await db.organization.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!organization) throw new Error(`There is no organization "${slug}"`);
  const config = await findOrganizationSermonConfig(db, organization.id);
  const channelId = await findYoutubeChannelId(organization.id);
  if (!config || channelId === null) {
    throw new Error(
      `The organization "${slug}" has no YouTube channel configured in its site settings`,
    );
  }
  return {
    id: organization.id,
    defaultLocale: config.defaultLocale,
    timezone: config.timezone,
    channelId,
  };
}

/**
 * The sermons own the revisions' author: the engine records who wrote each revision, and a system
 * has no user. The oldest admin of the organization stands in as author only; the audit rows of
 * the import itself carry the system actor.
 */
async function findAuthor(organizationId: string): Promise<SessionUser> {
  const user = await db.user.findFirst({
    where: {
      userRoles: {
        some: { role: { organizationId, key: ADMIN_ROLE_KEY } },
      },
    },
    orderBy: { id: "asc" },
    select: { id: true, name: true, email: true },
  });
  if (!user) {
    throw new Error(
      "The organization has no admin user to author the imported sermons",
    );
  }
  return user;
}

function systemContext(
  organizationId: string,
  author: SessionUser,
): AuthenticatedContext {
  return {
    requestId: IMPORT_ACTOR_LABEL,
    user: author,
    organizationId,
    access: {
      isAdmin: true,
      roles: [],
      grants: new Map(),
      ministryIds: [],
      sessionPolicy: { persistent: false, maxSessionSeconds: null },
    },
    ip: null,
    userAgent: null,
  };
}

async function createSeries(
  organization: Organization,
  playlist: ChannelPlaylistSummary,
  takenSlugs: Set<string>,
): Promise<string> {
  const title = truncateText(playlist.title, SERMON_SERIES_TITLE_MAX_LENGTH);
  const slug = pickFreeSlug(
    slugifyTitle(title, SERIES_SLUG_FALLBACK),
    takenSlugs,
  );
  takenSlugs.add(slug);
  return withTransaction(db, async (tx) => {
    const created = await createSeriesRow(
      tx,
      organization.id,
      {
        coverMediaId: null,
        plannedCount: null,
        order: 0,
        translations: {
          [organization.defaultLocale]: {
            title,
            slug,
            description: null,
            tags: [],
          },
        },
      },
      playlist.id,
    );
    await writeAudit(
      tx,
      auditSourceForSystem(organization.id, IMPORT_ACTOR_LABEL),
      {
        action: AUDIT_ACTIONS.sermonSeries.imported,
        entity: { type: "sermonSeries", id: created.id },
        after: { id: created.id, title, slug },
        metadata: { playlistId: playlist.id },
      },
    );
    return created.id;
  });
}

/** The series of each channel playlist: reused when it exists, created otherwise (unless dry). */
async function resolveSeries(
  organization: Organization,
  playlists: readonly ChannelPlaylistSummary[],
  dryRun: boolean,
): Promise<{ states: SeriesPlaylistState[]; created: ImportedSeries[] }> {
  const takenSlugs = await listSeriesSlugs(
    db,
    organization.id,
    organization.defaultLocale,
  );
  const states: SeriesPlaylistState[] = [];
  const created: ImportedSeries[] = [];
  for (const playlist of playlists) {
    const info = { playlistId: playlist.id, title: playlist.title };
    const existing = await findSeriesIdByPlaylist(
      db,
      organization.id,
      playlist.id,
    );
    if (existing) {
      states.push({ ...info, seriesId: existing.id });
      continue;
    }
    created.push(info);
    states.push({
      ...info,
      seriesId: dryRun
        ? null
        : await createSeries(organization, playlist, takenSlugs),
    });
  }
  return { states, created };
}

interface CurrentSermons {
  snapshots: SermonSnapshot[];
  takenSlugs: Set<string>;
}

async function readCurrentSermons(
  organization: Organization,
): Promise<CurrentSermons> {
  const rows = await listCurrentRevisionRows(organization.id, "SERMON");
  const snapshots = rows.map(
    (row) => row.snapshot as unknown as SermonSnapshot,
  );
  const takenSlugs = new Set(
    snapshots.flatMap(
      (snapshot) =>
        snapshot.translations[organization.defaultLocale]?.slug ?? [],
    ),
  );
  return { snapshots, takenSlugs };
}

async function fetchVideos(
  platform: VideoPlatform,
  videoIds: readonly string[],
): Promise<VideoInfo[]> {
  const videos: VideoInfo[] = [];
  for (let from = 0; from < videoIds.length; from += MAX_VIDEOS_PER_BATCH) {
    videos.push(
      ...(await platform.getVideos(
        videoIds.slice(from, from + MAX_VIDEOS_PER_BATCH),
      )),
    );
  }
  return videos;
}

interface SermonInput {
  organization: Organization;
  ctx: AuthenticatedContext;
  video: VideoInfo;
  series: { id: string; order: number } | undefined;
  takenSlugs: Set<string>;
}

/** One sermon, whole or not at all: the row, its link, a revision that goes live, the audit. */
async function writeSermon({
  organization,
  ctx,
  video,
  series,
  takenSlugs,
}: SermonInput): Promise<void> {
  await withTransaction(db, async (tx: Prisma.TransactionClient) => {
    const sermon = await createSermonRow(tx, organization.id);
    await createSermonLinkRow(tx, {
      ...toPlatformLinkFields(video, new Date()),
      organizationId: organization.id,
      sermonId: sermon.id,
      externalId: video.id,
      url: youtubeWatchUrl(video.id),
    });
    // Just the minimum: title, slug and date. The description stays on YouTube for the editors.
    const snapshot = buildSermonDraft({
      video: { ...video, description: "" },
      locale: organization.defaultLocale,
      timezone: organization.timezone,
      series,
      takenSlugs,
    });
    const key = {
      organizationId: organization.id,
      contentType: "SERMON",
      entityId: sermon.id,
    } as const;
    await createDraftRevision(tx, {
      key,
      number: await nextRevisionNumber(tx, key),
      authorId: ctx.user.id,
      snapshot: snapshot as unknown as Prisma.InputJsonObject,
    });
    await goLiveWorkingRevision(
      tx,
      { ctx, definition: EDITORIAL_TYPES.sermon, entityId: sermon.id },
      { importedFrom: "youtube" },
    );
    await writeAudit(
      tx,
      auditSourceForSystem(organization.id, IMPORT_ACTOR_LABEL),
      {
        action: AUDIT_ACTIONS.sermon.imported,
        entity: { type: "sermon", id: sermon.id },
        after: {
          id: sermon.id,
          videoId: video.id,
          ...(series ? { seriesId: series.id } : {}),
        },
      },
    );
    const slug = snapshot.translations[organization.defaultLocale]?.slug;
    if (slug) takenSlugs.add(slug);
  });
}

/** `false` when another run linked the same video meanwhile: it is imported, which is the goal. */
async function importSermon(input: SermonInput): Promise<boolean> {
  try {
    await writeSermon(input);
    return true;
  } catch (error) {
    if (isUniqueViolation(error)) return false;
    throw error;
  }
}

function seriesFor(
  placement: SeriesPlacement | undefined,
  states: readonly SeriesPlaylistState[],
): { id: string; order: number } | undefined {
  const seriesId = states.find(
    (state) => state.playlistId === placement?.playlistId,
  )?.seriesId;
  return placement && seriesId
    ? { id: seriesId, order: placement.order }
    : undefined;
}

interface SermonsPlan {
  pending: VideoInfo[];
  skipped: SkippedVideo[];
}

/** The videos of the sermons playlist that still need importing, and why the rest does not. */
async function planSermons(
  organization: Organization,
  platform: VideoPlatform,
  playlistId: string,
): Promise<SermonsPlan & { truncated: boolean }> {
  const listed = await platform.listPlaylistVideos(
    playlistId,
    MAX_LISTED_ITEMS,
  );
  const linked = await findLinkedVideoIds(
    organization.id,
    listed.map((video) => video.id),
  );
  const unlinked = listed.filter((video) => !linked.has(video.id));
  const pending = await fetchVideos(
    platform,
    unlinked.map((video) => video.id),
  );
  const available = new Set(pending.map((video) => video.id));
  const skipped: SkippedVideo[] = [
    ...listed
      .filter((video) => linked.has(video.id))
      .map(
        (video): SkippedVideo => ({
          videoId: video.id,
          reason: "already_linked",
        }),
      ),
    ...unlinked
      .filter((video) => !available.has(video.id))
      .map(
        (video): SkippedVideo => ({
          videoId: video.id,
          reason: "unavailable",
        }),
      ),
  ];
  return { pending, skipped, truncated: listed.length >= MAX_LISTED_ITEMS };
}

/** Where each pending sermon goes: the first channel playlist that has it, in playlist order. */
async function placeInSeries(
  platform: VideoPlatform,
  states: readonly SeriesPlaylistState[],
  pending: readonly VideoInfo[],
  snapshots: readonly SermonSnapshot[],
): Promise<Map<string, SeriesPlacement>> {
  const playlists = await Promise.all(
    states.map(async ({ playlistId }) => ({
      playlistId,
      videoIds: (
        await platform.listPlaylistVideos(playlistId, MAX_LISTED_ITEMS)
      ).map((video) => video.id),
    })),
  );
  const firstOrders = new Map(
    states.map(({ playlistId, seriesId }) => [
      playlistId,
      seriesId ? nextSeriesOrder(snapshots, seriesId) : 1,
    ]),
  );
  return assignSeriesPlaylists(
    new Set(pending.map((video) => video.id)),
    playlists,
    firstOrders,
  );
}

/**
 * Brings the videos of a sermons playlist in as published sermons, and the other playlists of the
 * channel as the series they belong to. Idempotent: a video already linked is skipped, a playlist
 * already imported as a series is reused. With `dryRun` it reads everything and writes nothing.
 */
export async function runYoutubeSermonImport({
  organizationSlug,
  playlist: playlistInput,
  dryRun,
  platform,
}: SermonImportOptions): Promise<SermonImportReport> {
  const organization = await loadOrganization(organizationSlug);
  const playlistId = platform.parsePlaylistId(playlistInput);
  if (playlistId === null) {
    throw new Error(`"${playlistInput}" is not a YouTube playlist id or URL`);
  }
  const sermonsPlaylist = await platform.getPlaylist(playlistId);
  if (sermonsPlaylist === "not_found") {
    throw new Error(`The playlist ${playlistId} does not exist or is private`);
  }

  const { pending, skipped, truncated } = await planSermons(
    organization,
    platform,
    playlistId,
  );
  const channelPlaylists = (
    await platform.listChannelPlaylists(
      organization.channelId,
      MAX_LISTED_ITEMS,
    )
  ).filter((candidate) => candidate.id !== playlistId);
  const { states, created } = await resolveSeries(
    organization,
    channelPlaylists,
    dryRun,
  );
  const current = await readCurrentSermons(organization);
  const placements = await placeInSeries(
    platform,
    states,
    pending,
    current.snapshots,
  );

  const ctx = pending.length
    ? systemContext(organization.id, await findAuthor(organization.id))
    : null;
  const imported: ImportedSermon[] = [];
  for (const video of pending) {
    const placement = placements.get(video.id);
    const written =
      !ctx || dryRun
        ? true
        : await importSermon({
            organization,
            ctx,
            video,
            series: seriesFor(placement, states),
            takenSlugs: current.takenSlugs,
          });
    if (written) {
      imported.push({
        videoId: video.id,
        title: video.title,
        seriesPlaylistId: placement?.playlistId ?? null,
      });
    } else {
      skipped.push({ videoId: video.id, reason: "already_linked" });
    }
  }

  const createdIds = new Set(created.map((series) => series.playlistId));
  return {
    dryRun,
    playlistTitle: sermonsPlaylist.title,
    seriesCreated: created,
    seriesReused: states
      .filter((state) => !createdIds.has(state.playlistId))
      .map(({ playlistId: id, title }) => ({ playlistId: id, title })),
    sermonsImported: imported,
    sermonsSkipped: skipped,
    truncated,
  };
}
