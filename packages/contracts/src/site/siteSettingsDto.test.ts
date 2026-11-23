import { describe, expect, test } from "bun:test";
import { serviceTimeDto, updateSiteSettingsBody } from "./siteSettingsDto";

describe("serviceTimeDto", () => {
  const slot = { kind: "worship", weekday: 0, start: "11:15", end: "13:00" };

  test("accepts a slot with and without an end", () => {
    expect(serviceTimeDto.safeParse(slot).success).toBe(true);
    expect(serviceTimeDto.safeParse({ ...slot, end: null }).success).toBe(true);
  });

  test("rejects an end that is not after the start", () => {
    expect(serviceTimeDto.safeParse({ ...slot, end: "11:15" }).success).toBe(
      false,
    );
    expect(serviceTimeDto.safeParse({ ...slot, end: "10:00" }).success).toBe(
      false,
    );
  });

  test("rejects malformed times and weekdays", () => {
    expect(serviceTimeDto.safeParse({ ...slot, start: "9:00" }).success).toBe(
      false,
    );
    expect(serviceTimeDto.safeParse({ ...slot, weekday: 7 }).success).toBe(
      false,
    );
  });
});

describe("updateSiteSettingsBody", () => {
  test("requires the version", () => {
    expect(updateSiteSettingsBody.safeParse({ name: "X" }).success).toBe(false);
    expect(updateSiteSettingsBody.safeParse({ version: 0 }).success).toBe(true);
  });

  test("rejects social links that are not web URLs", () => {
    const body = { version: 0, instagram: "javascript:alert(1)" };
    expect(updateSiteSettingsBody.safeParse(body).success).toBe(false);
  });

  test("accepts a YouTube channel id or null and rejects anything else", () => {
    const channel = (youtubeChannelId: string | null) =>
      updateSiteSettingsBody.safeParse({ version: 0, youtubeChannelId })
        .success;
    expect(channel("UCabcdefghijklmnopqrstuv")).toBe(true);
    expect(channel("UC_-bcdefghijklmnopqrst1")).toBe(true);
    expect(channel(null)).toBe(true);
    expect(channel("UCshort")).toBe(false);
    expect(channel("XXabcdefghijklmnopqrstuv")).toBe(false);
    expect(channel("https://youtube.com/@iglesia")).toBe(false);
  });

  test("rejects a SEO description over 160 characters", () => {
    const body = {
      version: 0,
      translations: { es: { seoDescription: "x".repeat(161) } },
    };
    expect(updateSiteSettingsBody.safeParse(body).success).toBe(false);
  });
});
