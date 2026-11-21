import { describe, expect, test } from "bun:test";
import type { PublicPageDto, PublicPageSummaryDto } from "@ancla/contracts";
import type { PublicClient } from "../publicClient";
import { createPageLoader, createPagesLoader } from "./pages";

const SUMMARY: PublicPageSummaryDto = {
  slug: "privacidad",
  title: "Privacidad",
};
const PAGE: PublicPageDto = {
  slug: "privacidad",
  title: "Privacidad",
  body: { type: "doc", content: [] },
  seoTitle: null,
  seoDescription: null,
  locale: "es",
  alternates: { es: "privacidad", en: "privacy" },
};

interface PageCall {
  slug: string;
  locale: string;
}

function clientFor(options: {
  pages?: (PublicPageSummaryDto[] | Error)[];
  page?: (PublicPageDto | null | Error)[];
  pagesCalls?: string[];
  pageCalls?: PageCall[];
}): PublicClient {
  const {
    pages = [[]],
    page = [null],
    pagesCalls = [],
    pageCalls = [],
  } = options;
  return {
    getMinistries: async () => {
      throw new Error("not used");
    },
    getMinistry: async () => null,
    getSettings: async () => {
      throw new Error("not used");
    },
    getPeople: async () => [],
    getVisit: async () => {
      throw new Error("not used");
    },
    async getPages(locale) {
      const result = pages[Math.min(pagesCalls.length, pages.length - 1)];
      pagesCalls.push(locale);
      if (result instanceof Error) throw result;
      return result as PublicPageSummaryDto[];
    },
    async getPage(slug, locale) {
      const result = page[Math.min(pageCalls.length, page.length - 1)];
      pageCalls.push({ slug, locale });
      if (result instanceof Error) throw result;
      return result as PublicPageDto | null;
    },
    getPosts: async () => {
      throw new Error("not used");
    },
    getPost: async () => null,
    recordPostView: async () => {},
  };
}

function loaderOptions(client: PublicClient | null, clock: { now: number }) {
  const warnings: string[] = [];
  return {
    options: {
      client,
      now: () => clock.now,
      ttlMs: 60_000,
      warn: (message: string) => warnings.push(message),
    },
    warnings,
  };
}

describe("createPagesLoader", () => {
  test("returns the summaries and caches them per locale", async () => {
    const calls: string[] = [];
    const clock = { now: 0 };
    const { options } = loaderOptions(
      clientFor({ pages: [[SUMMARY]], pagesCalls: calls }),
      clock,
    );
    const load = createPagesLoader(options);
    expect(await load("es")).toEqual([SUMMARY]);
    await load("es");
    await load("en");
    expect(calls).toEqual(["es", "en"]);
    clock.now += 61_000;
    await load("es");
    expect(calls).toEqual(["es", "en", "es"]);
  });

  test("serves [] when the API fails before any success, then the last good list", async () => {
    const clock = { now: 0 };
    const { options, warnings } = loaderOptions(
      clientFor({ pages: [new Error("down"), [SUMMARY], new Error("down")] }),
      clock,
    );
    const load = createPagesLoader(options);
    expect(await load("es")).toEqual([]);
    clock.now += 61_000;
    expect(await load("es")).toEqual([SUMMARY]);
    clock.now += 61_000;
    expect(await load("es")).toEqual([SUMMARY]);
    expect(warnings).toHaveLength(2);
  });

  test("without a client (env missing) it serves [] and never fetches", async () => {
    const { options } = loaderOptions(null, { now: 0 });
    expect(await createPagesLoader(options)("es")).toEqual([]);
  });
});

describe("createPageLoader", () => {
  test("returns the page and asks the client with slug and locale", async () => {
    const calls: PageCall[] = [];
    const { options } = loaderOptions(
      clientFor({ page: [PAGE], pageCalls: calls }),
      { now: 0 },
    );
    const load = createPageLoader(options);
    expect(await load("privacy", "en")).toEqual(PAGE);
    expect(calls).toEqual([{ slug: "privacy", locale: "en" }]);
  });

  test("caches per slug and locale", async () => {
    const calls: PageCall[] = [];
    const { options } = loaderOptions(
      clientFor({ page: [PAGE], pageCalls: calls }),
      { now: 0 },
    );
    const load = createPageLoader(options);
    await load("privacidad", "es");
    await load("privacidad", "es");
    await load("privacidad", "en");
    await load("terminos", "es");
    expect(calls).toHaveLength(3);
  });

  test("a 404 (null) is a real answer: cached as null within the TTL, no warning", async () => {
    const calls: PageCall[] = [];
    const clock = { now: 0 };
    const { options, warnings } = loaderOptions(
      clientFor({ page: [null, PAGE], pageCalls: calls }),
      clock,
    );
    const load = createPageLoader(options);
    expect(await load("privacidad", "es")).toBeNull();
    clock.now += 59_000;
    expect(await load("privacidad", "es")).toBeNull();
    expect(calls).toHaveLength(1);
    expect(warnings).toEqual([]);
    clock.now += 2_000;
    expect(await load("privacidad", "es")).toEqual(PAGE);
  });

  test("a page that was published and then paused turns into null after the TTL", async () => {
    const clock = { now: 0 };
    const { options } = loaderOptions(clientFor({ page: [PAGE, null] }), clock);
    const load = createPageLoader(options);
    expect(await load("privacidad", "es")).toEqual(PAGE);
    clock.now += 61_000;
    expect(await load("privacidad", "es")).toBeNull();
  });

  test("a network error serves null before any success, then the last good page", async () => {
    const clock = { now: 0 };
    const { options, warnings } = loaderOptions(
      clientFor({ page: [new Error("down"), PAGE, new Error("down")] }),
      clock,
    );
    const load = createPageLoader(options);
    expect(await load("privacidad", "es")).toBeNull();
    clock.now += 61_000;
    expect(await load("privacidad", "es")).toEqual(PAGE);
    clock.now += 61_000;
    expect(await load("privacidad", "es")).toEqual(PAGE);
    expect(warnings).toHaveLength(2);
  });

  test("without a client (env missing) it serves null and never fetches", async () => {
    const { options } = loaderOptions(null, { now: 0 });
    expect(await createPageLoader(options)("privacidad", "es")).toBeNull();
  });
});
