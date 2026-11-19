import { describe, expect, test } from "bun:test";
import type { PublicSiteSettingsDto } from "@ancla/contracts";
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
  serviceTimesSummary: null,
  social: {
    website: null,
    instagram: null,
    youtube: null,
    facebook: null,
    twitter: null,
    spotify: null,
    linkedin: null,
  },
  about: null,
};

interface Call {
  url: string;
  authorization: string | null;
}

function fakeFetch(
  respond: () => Response,
  calls: Call[] = [],
): typeof globalThis.fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({
      url: String(input),
      authorization: new Headers(init?.headers).get("Authorization"),
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
});
