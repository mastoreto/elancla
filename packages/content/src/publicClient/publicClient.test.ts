import { describe, expect, test } from "bun:test";
import type { PublicPageDto, PublicSiteSettingsDto } from "@ancla/contracts";
import { createPublicClient, PublicApiError } from "./publicClient";

const SETTINGS: PublicSiteSettingsDto = {
  locale: "es",
  name: "Iglesia",
  shortName: null,
  subtitle: null,
  url: "https://example.org",
  status: "online",
  contactEmail: null,
  address: {
    street: null,
    city: null,
    region: null,
    country: null,
    postalCode: null,
  },
  geo: null,
  themeColor: null,
  founded: null,
  timezone: "America/Montevideo",
  serviceTimes: [],
  sections: {
    blog: "active",
    calendar: "active",
    sermons: "active",
    ministries: "active",
    visit: "active",
  },
  seoDescription: null,
  social: {
    website: null,
    instagram: null,
    youtube: null,
    facebook: null,
    twitter: null,
    spotify: null,
    linkedin: null,
  },
};

interface Call {
  url: string;
  authorization: string | null;
  method?: string;
  forwardedFor?: string | null;
  body?: unknown;
}

function fakeFetch(
  respond: () => Response,
  calls: Call[] = [],
): typeof globalThis.fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    calls.push({
      url: String(input),
      authorization: headers.get("Authorization"),
      ...(init?.method
        ? {
            method: init.method,
            forwardedFor: headers.get("X-Forwarded-For"),
            body: JSON.parse(String(init.body)),
          }
        : {}),
    });
    return respond();
  }) as typeof globalThis.fetch;
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("createPublicClient", () => {
  test("asks the settings endpoint with the bearer key and parses the answer", async () => {
    const calls: Call[] = [];
    const client = createPublicClient({
      baseUrl: "https://crm.example.org/",
      apiKey: "sk_key",
      churchSlug: "el-ancla",
      fetch: fakeFetch(() => json(SETTINGS), calls),
    });
    expect(await client.getSettings()).toEqual(SETTINGS);
    expect(calls).toEqual([
      {
        url: "https://crm.example.org/api/public/v1/el-ancla/settings",
        authorization: "Bearer sk_key",
      },
    ]);
  });

  test("sends the locale as a query parameter", async () => {
    const calls: Call[] = [];
    const client = createPublicClient({
      baseUrl: "https://crm.example.org",
      apiKey: "k",
      churchSlug: "el-ancla",
      fetch: fakeFetch(() => json(SETTINGS), calls),
    });
    await client.getSettings("pt");
    expect(calls[0]?.url).toEndWith("/settings?locale=pt");
  });

  test("asks the calendar endpoint with the locale and the optional year", async () => {
    const calls: Call[] = [];
    const calendar = {
      year: 2027,
      published: false,
      timezone: "America/Montevideo",
      ministries: [],
      weekly: [],
      exceptions: [],
      events: [],
    };
    const client = createPublicClient({
      baseUrl: "https://crm.example.org",
      apiKey: "k",
      churchSlug: "el-ancla",
      fetch: fakeFetch(() => json(calendar), calls),
    });
    expect(await client.getCalendar("en", 2027)).toEqual(calendar);
    await client.getCalendar("es");
    expect(calls[0]?.url).toEndWith("/calendar?locale=en&year=2027");
    expect(calls[1]?.url).toEndWith("/calendar?locale=es");
  });

  test("rejects a calendar that does not match the contract", async () => {
    const client = createPublicClient({
      baseUrl: "https://crm.example.org",
      apiKey: "k",
      churchSlug: "el-ancla",
      fetch: fakeFetch(() => json({ year: 2026 })),
    });
    await expect(client.getCalendar("es")).rejects.toBeInstanceOf(
      PublicApiError,
    );
  });

  test("throws on a non-2xx answer", async () => {
    const client = createPublicClient({
      baseUrl: "https://crm.example.org",
      apiKey: "k",
      churchSlug: "el-ancla",
      fetch: fakeFetch(() => json({}, 401)),
    });
    const error = await client.getSettings().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(PublicApiError);
    expect((error as PublicApiError).status).toBe(401);
  });

  test("throws when the answer does not match the contract", async () => {
    const client = createPublicClient({
      baseUrl: "https://crm.example.org",
      apiKey: "k",
      churchSlug: "el-ancla",
      fetch: fakeFetch(() => json({ ...SETTINGS, id: "leaked" })),
    });
    await expect(client.getSettings()).rejects.toBeInstanceOf(PublicApiError);
  });

  test("lets a network failure through as an error", async () => {
    const client = createPublicClient({
      baseUrl: "https://crm.example.org",
      apiKey: "k",
      churchSlug: "el-ancla",
      fetch: (async () => {
        throw new TypeError("connection refused");
      }) as unknown as typeof globalThis.fetch,
    });
    await expect(client.getSettings()).rejects.toThrow("connection refused");
  });

  test("getPeople sends context and locale and parses the list", async () => {
    const calls: Call[] = [];
    const person = {
      name: "Ana",
      initials: "A",
      photo: null,
      bio: null,
      title: null,
      stats: [],
    };
    const client = createPublicClient({
      baseUrl: "https://crm.example.org",
      apiKey: "k",
      churchSlug: "el-ancla",
      fetch: fakeFetch(() => json([person]), calls),
    });
    expect(await client.getPeople("team", "en")).toEqual([person]);
    expect(calls[0]?.url).toEndWith("/people?context=team&locale=en");
  });

  test("getPeople rejects a list that does not match the contract", async () => {
    const client = createPublicClient({
      baseUrl: "https://crm.example.org",
      apiKey: "k",
      churchSlug: "el-ancla",
      fetch: fakeFetch(() => json([{ name: "Ana", id: "leaked" }])),
    });
    await expect(client.getPeople("team", "es")).rejects.toBeInstanceOf(
      PublicApiError,
    );
  });

  test("getVisit sends the locale and parses the visit content", async () => {
    const calls: Call[] = [];
    const visit = {
      directions: { parking: "Calle", transit: null, accessibility: null },
      faqs: [{ question: "Q", answer: "A" }],
    };
    const client = createPublicClient({
      baseUrl: "https://crm.example.org",
      apiKey: "k",
      churchSlug: "el-ancla",
      fetch: fakeFetch(() => json(visit), calls),
    });
    expect(await client.getVisit("pt")).toEqual(visit);
    expect(calls[0]?.url).toEndWith("/visit?locale=pt");
  });

  test("getVisit rejects a body that does not match the contract", async () => {
    const client = createPublicClient({
      baseUrl: "https://crm.example.org",
      apiKey: "k",
      churchSlug: "el-ancla",
      fetch: fakeFetch(() => json({ directions: {}, faqs: [] })),
    });
    await expect(client.getVisit("es")).rejects.toBeInstanceOf(PublicApiError);
  });

  const PAGE: PublicPageDto = {
    slug: "privacidad",
    title: "Privacidad",
    body: { type: "doc", content: [] },
    seoTitle: null,
    seoDescription: null,
    locale: "es",
    alternates: { es: "privacidad" },
  };
  const pageClient = (respond: () => Response, calls: Call[] = []) =>
    createPublicClient({
      baseUrl: "https://crm.example.org",
      apiKey: "k",
      churchSlug: "el-ancla",
      fetch: fakeFetch(respond, calls),
    });

  test("getPages sends the locale and returns the items", async () => {
    const calls: Call[] = [];
    const items = [{ slug: "privacidad", title: "Privacidad" }];
    const client = pageClient(() => json({ items }), calls);
    expect(await client.getPages("en")).toEqual(items);
    expect(calls[0]?.url).toEndWith("/pages?locale=en");
  });

  test("getPages rejects a body that does not match the contract", async () => {
    const client = pageClient(() => json({ items: [{ slug: "x" }] }));
    await expect(client.getPages("es")).rejects.toBeInstanceOf(PublicApiError);
  });

  test("getPage encodes the slug, sends the locale and parses the page", async () => {
    const calls: Call[] = [];
    const client = pageClient(() => json(PAGE), calls);
    expect(await client.getPage("pri vacidad", "es")).toEqual(PAGE);
    expect(calls[0]?.url).toEndWith("/pages/pri%20vacidad?locale=es");
  });

  test("getPage answers null for a 404 but throws for other statuses", async () => {
    expect(await pageClient(() => json({}, 404)).getPage("x", "es")).toBeNull();
    const error = await pageClient(() => json({}, 500))
      .getPage("x", "es")
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(PublicApiError);
  });

  test("getPage rejects a body that does not match the contract", async () => {
    const client = pageClient(() => json({ ...PAGE, body: { type: "nope" } }));
    await expect(client.getPage("x", "es")).rejects.toBeInstanceOf(
      PublicApiError,
    );
  });

  const emptyIndex = {
    locale: "es",
    posts: [],
    featured: null,
    categories: [],
    series: [],
    archive: [],
    popular: [],
    tags: [],
  };

  test("getPosts sends the locale and parses the index", async () => {
    const calls: Call[] = [];
    const client = pageClient(() => json(emptyIndex), calls);
    expect(await client.getPosts("en")).toEqual(emptyIndex);
    expect(calls[0]?.url).toEndWith("/posts?locale=en");
  });

  test("getPosts rejects an index that leaks an id", async () => {
    const client = pageClient(() => json({ ...emptyIndex, id: "leaked" }));
    await expect(client.getPosts("es")).rejects.toBeInstanceOf(PublicApiError);
  });

  test("getPost answers null for a 404 and encodes the slug", async () => {
    const calls: Call[] = [];
    const client = pageClient(() => json({}, 404), calls);
    expect(await client.getPost("a b", "es")).toBeNull();
    expect(calls[0]?.url).toEndWith("/posts/a%20b?locale=es");
  });

  test("getPost rejects a body that does not match the contract", async () => {
    const client = pageClient(() => json({ slug: "x" }));
    await expect(client.getPost("x", "es")).rejects.toBeInstanceOf(
      PublicApiError,
    );
  });

  test("recordPostView forwards the visitor address in x-forwarded-for and in the body", async () => {
    const calls: Call[] = [];
    const client = pageClient(() => new Response(null, { status: 204 }), calls);
    await client.recordPostView("mi-post", {
      ip: "203.0.113.7",
      userAgent: "Mozilla/5.0",
    });
    expect(calls).toEqual([
      {
        url: "https://crm.example.org/api/public/v1/el-ancla/posts/mi-post/views",
        authorization: "Bearer k",
        method: "POST",
        forwardedFor: "203.0.113.7",
        body: { ip: "203.0.113.7", userAgent: "Mozilla/5.0" },
      },
    ]);
  });

  test("recordPostView forwards an IPv6 address too", async () => {
    const calls: Call[] = [];
    const client = pageClient(() => new Response(null, { status: 204 }), calls);
    await client.recordPostView("p", { ip: "2001:db8::1", userAgent: "x" });
    expect(calls[0]?.forwardedFor).toBe("2001:db8::1");
  });

  test("recordPostView does not forward an address that is not an address", async () => {
    const calls: Call[] = [];
    const client = pageClient(() => new Response(null, { status: 204 }), calls);
    await client.recordPostView("p", { ip: "1.2.3.4, evil", userAgent: "x" });
    expect(calls[0]?.forwardedFor).toBeNull();
  });

  test("recordPostView throws on a non success status", async () => {
    const client = pageClient(() => json({}, 429));
    const error = await client
      .recordPostView("p", { ip: "1.1.1.1", userAgent: "x" })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(PublicApiError);
    expect((error as PublicApiError).status).toBe(429);
  });
});
