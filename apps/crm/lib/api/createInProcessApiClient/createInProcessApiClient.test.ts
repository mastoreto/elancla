import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { createInProcessApiClient } from "./createInProcessApiClient";

const echoCookie = new Hono().all("/api/health", (c) =>
  c.json({ cookie: c.req.header("cookie") ?? null, url: c.req.url }),
);

describe("createInProcessApiClient", () => {
  test("forwards the caller's cookie to the API", async () => {
    const client = createInProcessApiClient({
      dispatch: (request) => echoCookie.fetch(request),
      cookie: "better-auth.session_token=abc",
    });
    const res = await client.health.$get();
    const body = (await res.json()) as unknown as { cookie: string | null; url: string };
    expect(body.cookie).toBe("better-auth.session_token=abc");
    expect(body.url).toBe("http://localhost/api/health");
  });

  test("sends no cookie when the caller has none", async () => {
    const client = createInProcessApiClient({
      dispatch: (request) => echoCookie.fetch(request),
      cookie: null,
    });
    const body = (await (await client.health.$get()).json()) as unknown as {
      cookie: string | null;
    };
    expect(body.cookie).toBeNull();
  });
});
