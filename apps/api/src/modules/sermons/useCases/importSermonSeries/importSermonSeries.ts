import {
  AUDIT_ACTIONS,
  type ImportSeriesBody,
  SERMON_SERIES_DESCRIPTION_MAX_LENGTH,
  SERMON_SERIES_TITLE_MAX_LENGTH,
  type SermonSeriesDto,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import type { PlaylistInfo } from "../../../../core/platforms";
import { getStorageEnv } from "../../../../core/storage";
import { isUniqueViolation } from "../../../editorial";
import {
  createSeriesRow,
  findOrganizationSermonConfig,
  findSeriesIdByPlaylist,
  listSeriesSlugs,
} from "../../data";
import {
  InvalidPlaylistIdError,
  PlaylistAlreadyImportedError,
  PlaylistNotFoundError,
  pickFreeSlug,
  slugifyTitle,
  truncateText,
} from "../../domain";
import { toSermonSeriesDto } from "../../mappers";
import { withVideoPlatform } from "../withVideoPlatform";

const SERIES_SLUG_FALLBACK = "series";

function fetchPlaylist(input: string): Promise<PlaylistInfo> {
  return withVideoPlatform(async (platform) => {
    const playlistId = platform.parsePlaylistId(input);
    if (playlistId === null) throw new InvalidPlaylistIdError();
    const playlist = await platform.getPlaylist(playlistId);
    if (playlist === "not_found") throw new PlaylistNotFoundError();
    return playlist;
  });
}

async function createFromPlaylist(
  ctx: AuthenticatedContext,
  playlist: PlaylistInfo,
): Promise<SermonSeriesDto> {
  const publicBaseUrl = getStorageEnv().MEDIA_PUBLIC_BASE_URL;
  return withTransaction(db, async (tx) => {
    const config = await findOrganizationSermonConfig(tx, ctx.organizationId);
    if (!config) throw new NotFoundError("The organization was not found");
    if (await findSeriesIdByPlaylist(tx, ctx.organizationId, playlist.id)) {
      throw new PlaylistAlreadyImportedError();
    }
    const title = truncateText(playlist.title, SERMON_SERIES_TITLE_MAX_LENGTH);
    const description = truncateText(
      playlist.description,
      SERMON_SERIES_DESCRIPTION_MAX_LENGTH,
    );
    const taken = await listSeriesSlugs(
      tx,
      ctx.organizationId,
      config.defaultLocale,
    );
    // ponytail: the cover stays empty; the playlist thumbnail is a remote URL and a series cover
    // is a media file of the organization, which nothing here downloads and stores.
    const created = toSermonSeriesDto(
      await createSeriesRow(
        tx,
        ctx.organizationId,
        {
          coverMediaId: null,
          plannedCount: null,
          order: 0,
          translations: {
            [config.defaultLocale]: {
              title,
              slug: pickFreeSlug(
                slugifyTitle(title, SERIES_SLUG_FALLBACK),
                taken,
              ),
              description: description === "" ? null : description,
              tags: [],
            },
          },
        },
        playlist.id,
      ),
      undefined,
      publicBaseUrl,
    );
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.sermonSeries.imported,
      entity: { type: "sermonSeries", id: created.id },
      after: created,
      metadata: { playlistId: playlist.id },
    });
    return created;
  });
}

/**
 * Creates the series linked to a YouTube playlist, with its title and description preloaded in the
 * default language. It creates no sermons. Errors: 422 `invalid_playlist_id`, 404
 * `playlist_not_found`, 409 `playlist_already_imported`, 503 `platform_unavailable`.
 */
export async function importSermonSeries(
  ctx: AuthenticatedContext,
  { playlist: input }: ImportSeriesBody,
): Promise<SermonSeriesDto> {
  const playlist = await fetchPlaylist(input);
  try {
    return await createFromPlaylist(ctx, playlist);
  } catch (error) {
    // Two requests for the same playlist race on the partial unique index of the series.
    if (isUniqueViolation(error)) throw new PlaylistAlreadyImportedError();
    throw error;
  }
}
