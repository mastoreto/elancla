import { describe, expect, test } from "bun:test";
import type {
  PublicBlogIndexDto,
  PublicPostDto,
  RecordPostViewBody,
} from "@ancla/contracts";
import type { PublicClient } from "../publicClient";
import {
  createBlogIndexLoader,
  createPostLoader,
  createPostViewRecorder,
} from "./blog";

const INDEX: PublicBlogIndexDto = {
  locale: "es",
  posts: [],
  featured: null,
  categories: [{ slug: "fe", name: "Fe", count: 1 }],
  series: [],
  archive: [],
  popular: [],
  tags: [],
};
const POST = { slug: "mi-post", title: "Mi post" } as PublicPostDto;
const VISITOR: RecordPostViewBody = { ip: "203.0.113.7", userAgent: "UA" };

interface Calls {
  index: string[];
  post: { slug: string; locale: string }[];
  view: { slug: string; visitor: RecordPostViewBody }[];
}

function clientFor(options: {
  index?: (PublicBlogIndexDto | Error)[];
  post?: (PublicPostDto | null | Error)[];
  view?: Error;
  calls?: Calls;
}): PublicClient {
  const { index = [INDEX], post = [null], view, calls } = options;
  const log = calls ?? { index: [], post: [], view: [] };
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
    getPages: async () => [],
    getPage: async () => null,
    async getPosts(locale) {
      const result = index[Math.min(log.index.length, index.length - 1)];
      log.index.push(locale);
      if (result instanceof Error) throw result;
      return result as PublicBlogIndexDto;
    },
    async getPost(slug, locale) {
      const result = post[Math.min(log.post.length, post.length - 1)];
      log.post.push({ slug, locale });
      if (result instanceof Error) throw result;
      return result as PublicPostDto | null;
    },
    async recordPostView(slug, visitor) {
      log.view.push({ slug, visitor });
      if (view) throw view;
    },
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

describe("createBlogIndexLoader", () => {
  test("returns the index and caches it per locale", async () => {
    const calls: Calls = { index: [], post: [], view: [] };
    const clock = { now: 0 };
    const { options } = loaderOptions(clientFor({ calls }), clock);
    const getBlogIndex = createBlogIndexLoader(options);
    expect(await getBlogIndex("es")).toEqual(INDEX);
    expect(await getBlogIndex("es")).toEqual(INDEX);
    await getBlogIndex("en");
    expect(calls.index).toEqual(["es", "en"]);
  });

  test("before the first success serves an empty index in the locale asked", async () => {
    const { options, warnings } = loaderOptions(
      clientFor({ index: [new Error("down")] }),
      { now: 0 },
    );
    const index = await createBlogIndexLoader(options)("en");
    expect(index.locale).toBe("en");
    expect(index.posts).toEqual([]);
    expect(index.featured).toBeNull();
    expect(warnings).toHaveLength(1);
  });

  test("keeps the last good index when the API fails later", async () => {
    const clock = { now: 0 };
    const { options } = loaderOptions(
      clientFor({ index: [INDEX, new Error("down")] }),
      clock,
    );
    const getBlogIndex = createBlogIndexLoader(options);
    await getBlogIndex("es");
    clock.now = 61_000;
    expect(await getBlogIndex("es")).toEqual(INDEX);
  });

  test("without a client serves an empty index and does not touch the network", async () => {
    const { options } = loaderOptions(null, { now: 0 });
    const index = await createBlogIndexLoader(options)("pt");
    expect(index.locale).toBe("pt");
    expect(index.posts).toEqual([]);
  });
});

describe("createPostLoader", () => {
  test("asks the API by slug and locale and caches it", async () => {
    const calls: Calls = { index: [], post: [], view: [] };
    const { options } = loaderOptions(clientFor({ post: [POST], calls }), {
      now: 0,
    });
    const getPost = createPostLoader(options);
    expect(await getPost("mi-post", "es")).toEqual(POST);
    expect(await getPost("mi-post", "es")).toEqual(POST);
    expect(calls.post).toEqual([{ slug: "mi-post", locale: "es" }]);
  });

  test("a 404 is a successful answer: null, cached for the window", async () => {
    const calls: Calls = { index: [], post: [], view: [] };
    const clock = { now: 0 };
    const { options, warnings } = loaderOptions(
      clientFor({ post: [null, POST], calls }),
      clock,
    );
    const getPost = createPostLoader(options);
    expect(await getPost("nope", "es")).toBeNull();
    expect(await getPost("nope", "es")).toBeNull();
    expect(calls.post).toHaveLength(1);
    expect(warnings).toHaveLength(0);
    clock.now = 61_000;
    expect(await getPost("nope", "es")).toEqual(POST);
  });

  test("falls back to null when the API is down before the first success", async () => {
    const { options, warnings } = loaderOptions(
      clientFor({ post: [new Error("down")] }),
      { now: 0 },
    );
    expect(await createPostLoader(options)("x", "es")).toBeNull();
    expect(warnings).toHaveLength(1);
  });

  test("without a client answers null", async () => {
    const { options } = loaderOptions(null, { now: 0 });
    expect(await createPostLoader(options)("x", "es")).toBeNull();
  });
});

describe("createPostViewRecorder", () => {
  test("hands the visitor to the client untouched", async () => {
    const calls: Calls = { index: [], post: [], view: [] };
    const record = createPostViewRecorder({ client: clientFor({ calls }) });
    await record("mi-post", VISITOR);
    expect(calls.view).toEqual([{ slug: "mi-post", visitor: VISITOR }]);
  });

  test("swallows the error and warns instead of rejecting", async () => {
    const warnings: string[] = [];
    const record = createPostViewRecorder({
      client: clientFor({ view: new Error("429") }),
      warn: (message) => warnings.push(message),
    });
    await expect(record("mi-post", VISITOR)).resolves.toBeUndefined();
    expect(warnings).toHaveLength(1);
  });

  test("without a client it does nothing", async () => {
    await expect(
      createPostViewRecorder({ client: null })("x", VISITOR),
    ).resolves.toBeUndefined();
  });
});
