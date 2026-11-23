import { afterEach, describe, expect, test } from "bun:test";
import { createYoutubePlatform } from "../createYoutubePlatform";
import { getVideoPlatform, setVideoPlatformForTests } from "./getVideoPlatform";

afterEach(() => setVideoPlatformForTests(undefined));

describe("getVideoPlatform", () => {
  test("is null without YOUTUBE_API_KEY, so callers can tell the platform is unavailable", () => {
    // The test environment (.env.test) sets no key.
    expect(getVideoPlatform()).toBeNull();
  });

  test("tests can inject a platform, or null, and restore the default", () => {
    const platform = createYoutubePlatform({
      apiKey: "key",
      fetch: async () => Response.json({}),
    });
    setVideoPlatformForTests(platform);
    expect(getVideoPlatform()).toBe(platform);
    setVideoPlatformForTests(null);
    expect(getVideoPlatform()).toBeNull();
  });
});
