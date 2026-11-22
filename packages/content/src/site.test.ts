import { describe, expect, test } from "bun:test";
import type { PublicSiteSettingsDto } from "@ancla/contracts";
import type { PublicClient } from "./publicClient";
import {
  createPublicClientFromEnv,
  createSiteConfigLoader,
  readCacheTtlMs,
  SITE_FALLBACK,
  toSiteConfig,
} from "./site";

const SETTINGS: PublicSiteSettingsDto = {
  locale: "es",
  name: "Iglesia de prueba",
  shortName: "Prueba",
  subtitle: null,
  url: "https://prueba.example.org",
  status: "maintenance",
  contactEmail: "hola@prueba.example.org",
  address: {
    street: "Calle 1",
    city: "Ciudad",
    region: null,
    country: "UY",
    postalCode: "11000",
  },
  geo: { latitude: 1.5, longitude: -2.5 },
  themeColor: "#123456",
  founded: "2001",
  timezone: "America/Argentina/Buenos_Aires",
  serviceTimes: [{ kind: "worship", weekday: 0, start: "10:00", end: null }],
  sections: {
    blog: "maintenance",
    calendar: "active",
    sermons: "active",
    ministries: "active",
    visit: "outOfService",
  },
  seoDescription: "Descripcion de prueba",
  social: {
    website: null,
    instagram: "https://instagram.com/prueba",
    youtube: null,
    facebook: null,
    twitter: null,
    spotify: null,
    linkedin: null,
  },
};

function clientReturning(
  results: (PublicSiteSettingsDto | Error)[],
  calls: { count: number },
): PublicClient {
  return {
    getMinistries: async () => {
      throw new Error("not used");
    },
    getMinistry: async () => null,
    async getSettings() {
      const result = results[Math.min(calls.count, results.length - 1)];
      calls.count += 1;
      if (result instanceof Error) throw result;
      return result as PublicSiteSettingsDto;
    },
    getPages: async () => [],
    getPage: async () => null,
    getPosts: async () => {
      throw new Error("not used");
    },
    getPost: async () => null,
    recordPostView: async () => {},
    getPeople: async () => [],
    getVisit: async () => {
      throw new Error("not used");
    },
  };
}

function loaderFor(client: PublicClient | null, clock: { now: number }) {
  const warnings: string[] = [];
  const load = createSiteConfigLoader({
    client,
    now: () => clock.now,
    ttlMs: 60_000,
    warn: (message) => warnings.push(message),
  });
  return { load, warnings };
}

describe("toSiteConfig", () => {
  test("maps the public settings and keeps the fallback for what is null", () => {
    const site = toSiteConfig(SETTINGS);
    expect(site.name).toBe("Iglesia de prueba");
    expect(site.serviceTimes).toEqual(SETTINGS.serviceTimes);
    expect(site.timezone).toBe("America/Argentina/Buenos_Aires");
    expect(site.sections.blog).toBe("maintenance");
    expect(site.seoDescription).toBe("Descripcion de prueba");
    expect(site.status).toBe("maintenance");
    expect(site.themeColor).toBe("#123456");
    expect(site.geo).toEqual({ latitude: 1.5, longitude: -2.5 });
    expect(site.address.street).toBe("Calle 1");
    expect(site.address.region).toBe(SITE_FALLBACK.address.region);
    expect(site.social.instagram).toBe("https://instagram.com/prueba");
    expect(site.social.youtube).toBe(SITE_FALLBACK.social.youtube);
    expect(site.lang).toBe(SITE_FALLBACK.lang);
  });

  test("a church without coordinates uses the fallback ones", () => {
    expect(toSiteConfig({ ...SETTINGS, geo: null }).geo).toEqual(
      SITE_FALLBACK.geo,
    );
  });
});

describe("createSiteConfigLoader", () => {
  test("the TTL avoids a second fetch and expires after the window", async () => {
    const calls = { count: 0 };
    const clock = { now: 1_000 };
    const { load } = loaderFor(clientReturning([SETTINGS], calls), clock);
    await load();
    clock.now += 59_000;
    await load();
    expect(calls.count).toBe(1);
    clock.now += 2_000;
    await load();
    expect(calls.count).toBe(2);
  });

  test("concurrent callers share one fetch", async () => {
    const calls = { count: 0 };
    const { load } = loaderFor(clientReturning([SETTINGS], calls), {
      now: 0,
    });
    await Promise.all([load(), load(), load()]);
    expect(calls.count).toBe(1);
  });

  test("when the API fails it serves the last good value, then the fallback before any", async () => {
    const calls = { count: 0 };
    const clock = { now: 0 };
    const { load, warnings } = loaderFor(
      clientReturning([new Error("down"), SETTINGS, new Error("down")], calls),
      clock,
    );
    // Never succeeded yet: the fallback.
    expect(await load()).toBe(SITE_FALLBACK);
    clock.now += 61_000;
    expect((await load()).name).toBe("Iglesia de prueba");
    clock.now += 61_000;
    // Down again: the last good value, not the fallback.
    expect((await load()).name).toBe("Iglesia de prueba");
    expect(warnings).toHaveLength(2);
  });

  test("a failing API is not retried inside the window", async () => {
    const calls = { count: 0 };
    const clock = { now: 0 };
    const { load, warnings } = loaderFor(
      clientReturning([new Error("down")], calls),
      clock,
    );
    await load();
    await load();
    await load();
    expect(calls.count).toBe(1);
    expect(warnings).toHaveLength(1);
  });

  test("without a client it serves the fallback and never fetches", async () => {
    const { load } = loaderFor(null, { now: 0 });
    expect(await load()).toBe(SITE_FALLBACK);
    expect(await load("en")).toBe(SITE_FALLBACK);
  });

  test("caches per locale and asks the client for each one", async () => {
    const locales: (string | undefined)[] = [];
    const client: PublicClient = {
      getMinistries: async () => {
        throw new Error("not used");
      },
      getMinistry: async () => null,
      async getSettings(locale) {
        locales.push(locale);
        return { ...SETTINGS, name: `site-${locale ?? "default"}` };
      },
      getPages: async () => [],
      getPage: async () => null,
      getPosts: async () => {
        throw new Error("not used");
      },
      getPost: async () => null,
      recordPostView: async () => {},
      getPeople: async () => [],
      getVisit: async () => {
        throw new Error("not used");
      },
    };
    const { load } = loaderFor(client, { now: 0 });
    expect((await load()).name).toBe("site-default");
    expect((await load("en")).name).toBe("site-en");
    await load("en");
    expect(locales).toEqual([undefined, "en"]);
  });
});

describe("createPublicClientFromEnv", () => {
  test("is null unless the three variables are present", () => {
    const silent = () => {};
    expect(createPublicClientFromEnv({}, silent)).toBeNull();
    expect(
      createPublicClientFromEnv(
        { API_URL: "http://x", SITE_API_KEY: "k" },
        silent,
      ),
    ).toBeNull();
    expect(
      createPublicClientFromEnv({
        API_URL: "http://x",
        SITE_API_KEY: "k",
        SITE_CHURCH_SLUG: "el-ancla",
      }),
    ).not.toBeNull();
  });
});

describe("misconfiguration is visible", () => {
  test("warns naming only the missing variables and the fix command", () => {
    const warnings: string[] = [];
    const client = createPublicClientFromEnv(
      { API_URL: "http://x", SITE_API_KEY: "k" },
      (message) => warnings.push(message),
    );
    expect(client).toBeNull();
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("SITE_CHURCH_SLUG");
    expect(warnings[0]).not.toContain("API_URL");
    expect(warnings[0]).toContain("site-key:create");
  });

  test("does not warn when everything is set", () => {
    const warnings: string[] = [];
    createPublicClientFromEnv(
      { API_URL: "http://x", SITE_API_KEY: "k", SITE_CHURCH_SLUG: "s" },
      (message) => warnings.push(message),
    );
    expect(warnings).toEqual([]);
  });

  test("reads the cache TTL from the environment with a safe default", () => {
    expect(readCacheTtlMs({})).toBe(60_000);
    expect(readCacheTtlMs({ SITE_CONFIG_TTL_MS: "500" })).toBe(500);
    expect(readCacheTtlMs({ SITE_CONFIG_TTL_MS: "abc" })).toBe(60_000);
    expect(readCacheTtlMs({ SITE_CONFIG_TTL_MS: "-5" })).toBe(60_000);
  });
});
