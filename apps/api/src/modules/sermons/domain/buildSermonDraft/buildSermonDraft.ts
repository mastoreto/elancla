import {
  SERMON_SUMMARY_MAX_LENGTH,
  SERMON_TITLE_MAX_LENGTH,
  type SermonSnapshot,
  sermonSnapshot,
} from "@ancla/contracts";
import type { VideoInfo } from "../../../../core/platforms";
import { urlDate } from "../../../blog";
import { slugifyTitle } from "../slugifyTitle";
import { truncateText } from "../truncateText";

export interface SermonDraftInput {
  video: VideoInfo;
  /** The organization's default language: the only one the first draft is written in. */
  locale: string;
  /** IANA zone: `preachedOn` is the day the video went up in the church's own time. */
  timezone: string;
  series?: { id: string; order: number };
}

/**
 * The first draft of a sermon created from a video: title and summary in the default language and
 * `preachedOn` from the video date. Everything else is left for the editor. What the platform says
 * about the video (cover, duration, views) is not here: it lives in `PlatformLink`.
 */
export function buildSermonDraft({
  video,
  locale,
  timezone,
  series,
}: SermonDraftInput): SermonSnapshot {
  const title = truncateText(video.title, SERMON_TITLE_MAX_LENGTH);
  const summary = truncateText(video.description, SERMON_SUMMARY_MAX_LENGTH);
  return sermonSnapshot.parse({
    translations: {
      [locale]: {
        title,
        slug: slugifyTitle(title),
        ...(summary === "" ? {} : { summary }),
      },
    },
    preachedOn: urlDate(new Date(video.publishedAt), timezone),
    ...(series ? { seriesId: series.id, seriesOrder: series.order } : {}),
  });
}
