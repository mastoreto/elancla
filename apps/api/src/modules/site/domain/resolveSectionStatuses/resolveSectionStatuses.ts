import {
  SITE_SECTION_KEYS,
  type SiteSectionKey,
  type SiteSectionStatus,
  siteSectionStatus,
} from "@ancla/contracts";

/**
 * The stored JSON as a complete map: every known key is present (missing ones are `active`) and
 * unknown keys or values are dropped, so an old or hand-edited row can never leak junk.
 */
export function resolveSectionStatuses(
  stored: unknown,
): Record<SiteSectionKey, SiteSectionStatus> {
  const source =
    typeof stored === "object" && stored !== null && !Array.isArray(stored)
      ? (stored as Record<string, unknown>)
      : {};
  return Object.fromEntries(
    SITE_SECTION_KEYS.map((key) => {
      const parsed = siteSectionStatus.safeParse(source[key]);
      return [key, parsed.success ? parsed.data : "active"];
    }),
  ) as Record<SiteSectionKey, SiteSectionStatus>;
}
