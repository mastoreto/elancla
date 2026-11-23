import { getApiEnv } from "../../env";
import { createYoutubePlatform } from "../createYoutubePlatform";
import type { VideoPlatform } from "../types";

let current: VideoPlatform | null | undefined;

/**
 * The video platform of the API, built on first use. `null` means there is no `YOUTUBE_API_KEY`
 * (local work, tests): callers must handle it (lookup answers 503 `platform_unavailable`, live
 * answers `{ live: false }`) instead of calling a platform that cannot answer.
 */
export function getVideoPlatform(): VideoPlatform | null {
  if (current !== undefined) return current;
  const { YOUTUBE_API_KEY } = getApiEnv();
  current = YOUTUBE_API_KEY
    ? createYoutubePlatform({ apiKey: YOUTUBE_API_KEY, fetch })
    : null;
  return current;
}

/**
 * Tests swap the platform for one fed by recorded responses (or `null` for "no key"); `undefined`
 * restores the environment-driven default. Production code never calls this.
 */
export function setVideoPlatformForTests(
  platform: VideoPlatform | null | undefined,
): void {
  current = platform;
}
