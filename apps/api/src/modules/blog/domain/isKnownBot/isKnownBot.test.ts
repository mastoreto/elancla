import { describe, expect, test } from "bun:test";
import { isKnownBot } from "./isKnownBot";

describe("isKnownBot", () => {
  test("flags crawlers and tools", () => {
    for (const userAgent of [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 (compatible; bingbot/2.0)",
      "curl/8.4.0",
      "HeadlessChrome/120.0",
      "facebookexternalhit/1.1",
    ]) {
      expect(isKnownBot(userAgent)).toBe(true);
    }
  });

  test("an empty or blank user agent is a bot", () => {
    expect(isKnownBot("")).toBe(true);
    expect(isKnownBot("   ")).toBe(true);
  });

  test("lets real browsers through", () => {
    expect(
      isKnownBot(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      ),
    ).toBe(false);
  });
});
