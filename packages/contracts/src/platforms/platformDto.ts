import { z } from "zod";

/** Max length of what a user pastes to find a video (URL or id). */
export const PLATFORM_INPUT_MAX_LENGTH = 300;

/** Lower case on the wire, like the editorial states. */
export const PLATFORMS = ["youtube", "spotify", "apple_podcasts"] as const;
export const platformDto = z.enum(PLATFORMS);
export type PlatformDto = z.infer<typeof platformDto>;

/** What a pasted video is going to become. */
export const PLATFORM_LOOKUP_TARGETS = ["sermon", "podcast-episode"] as const;
export const platformLookupTarget = z.enum(PLATFORM_LOOKUP_TARGETS);
export type PlatformLookupTarget = z.infer<typeof platformLookupTarget>;

/** `POST /content/platform-lookup`: the pasted URL or id, and what it is for. */
export const platformLookupBody = z.strictObject({
  input: z.string().trim().min(1).max(PLATFORM_INPUT_MAX_LENGTH),
  for: platformLookupTarget,
});
export type PlatformLookupBody = z.infer<typeof platformLookupBody>;

/**
 * Preview of the video before anything is created. 422 `invalid_video_id`, 404 `video_not_found`,
 * 422 `video_private` and 503 `platform_unavailable` are the failures (RFC 9457 problems).
 */
export const platformLookupDto = z.strictObject({
  externalId: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnailUrl: z.string().nullable(),
  durationSeconds: z.number().int().min(0).nullable(),
  publishedAt: z.iso.datetime(),
  /** The video already belongs to a sermon or an episode (creating from it would be a 409). */
  alreadyLinked: z.boolean(),
});
export type PlatformLookupDto = z.infer<typeof platformLookupDto>;

/** A recent upload of the channel that is not linked yet. Only to choose from: it creates nothing. */
export const platformSuggestionDto = z.strictObject({
  externalId: z.string(),
  title: z.string(),
  thumbnailUrl: z.string().nullable(),
  publishedAt: z.iso.datetime(),
});
export type PlatformSuggestionDto = z.infer<typeof platformSuggestionDto>;

export const platformSuggestionListDto = z.strictObject({
  items: z.array(platformSuggestionDto),
});
export type PlatformSuggestionListDto = z.infer<
  typeof platformSuggestionListDto
>;

/**
 * What a platform says about a sermon or an episode, as the CRM reads it. `viewCount` is an internal
 * metric: the public API never exposes it.
 */
export const platformLinkDto = z.strictObject({
  id: z.uuid(),
  platform: platformDto,
  externalId: z.string(),
  url: z.string(),
  thumbnailUrl: z.string().nullable(),
  durationSeconds: z.number().int().min(0).nullable(),
  platformPublishedAt: z.iso.datetime().nullable(),
  viewCount: z.number().int().min(0).nullable(),
  /** When the data was last read from the platform; null for a manual link. */
  fetchedAt: z.iso.datetime().nullable(),
});
export type PlatformLinkDto = z.infer<typeof platformLinkDto>;
