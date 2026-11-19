import { beforeAll, describe, expect, spyOn, test } from "bun:test";
import { createRoute, z } from "@hono/zod-openapi";
import { getApiEnv } from "../env";
import {
  ConflictError,
  type DomainError,
  ForbiddenError,
  NotFoundError,
  UnauthenticatedError,
  ValidationError,
} from "../errors";
import { createApp } from "./createApp";

const CRM_ORIGIN = getApiEnv().CRM_ORIGIN;
const PROBLEM_JSON = "application/problem+json";
const jsonHeaders = (
  extra: Record<string, string> = {},
): Record<string, string> => ({
  "Content-Type": "application/json",
  Origin: CRM_ORIGIN,
  ...extra,
});

const strictRoute = createRoute({
  method: "post",
  path: "/strict",
  request: {
    body: {
      content: {
        "application/json": { schema: z.strictObject({ name: z.string() }) },
      },
    },
  },
  responses: { 200: { description: "ok" } },
});

const pagedRoute = createRoute({
  method: "get",
  path: "/paged",
  request: {
    query: z.strictObject({
      limit: z.coerce.number().int().min(1).max(100).default(25),
    }),
  },
  responses: { 200: { description: "ok" } },
});

function buildApp() {
  const app = createApp();
  const domainErrors: [string, DomainError, number][] = [
    ["validation", new ValidationError("bad input"), 400],
    ["unauthenticated", new UnauthenticatedError(), 401],
    ["forbidden", new ForbiddenError(), 403],
    ["not-found", new NotFoundError(), 404],
    ["conflict", new ConflictError(), 409],
  ];
  for (const [name, error] of domainErrors) {
    app.get(`/errors/${name}`, () => {
      throw error;
    });
  }
  app.get("/errors/unexpected", () => {
    throw new Error("secret internal detail: password=hunter2");
  });
  app.get("/ok", (c) => c.json({ ok: true }));
  app.post("/echo", (c) => c.json({ reached: true }));
  app.openapi(strictRoute, (c) =>
    c.json({ name: c.req.valid("json").name }, 200),
  );
  app.openapi(pagedRoute, (c) => c.json(c.req.valid("query"), 200));
  return app;
}

const app = buildApp();

// The unexpected-error test logs the internal error on purpose; keep the test output readable.
beforeAll(() => {
  spyOn(console, "error").mockImplementation(() => undefined);
});

describe("error translation", () => {
  const cases: [string, number][] = [
    ["validation", 400],
    ["unauthenticated", 401],
    ["forbidden", 403],
    ["not-found", 404],
    ["conflict", 409],
  ];
  for (const [name, status] of cases) {
    test(`${name} -> ${status} problem+json with requestId`, async () => {
      const res = await app.request(`/api/errors/${name}`);
      expect(res.status).toBe(status);
      expect(res.headers.get("content-type")).toContain(PROBLEM_JSON);
      const body = await res.json();
      expect(body.status).toBe(status);
      expect(body.requestId).toBe(res.headers.get("x-request-id") as string);
      expect(body.stack).toBeUndefined();
    });
  }

  test("an unexpected error is a 500 without stack or internal message", async () => {
    const res = await app.request("/api/errors/unexpected");
    const text = await res.text();
    expect(res.status).toBe(500);
    expect(text).not.toContain("hunter2");
    expect(text).not.toContain("stack");
    expect(JSON.parse(text).code).toBe("internal_error");
  });

  test("an unknown route is a 404 problem+json with requestId", async () => {
    const res = await app.request("/api/nope");
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain(PROBLEM_JSON);
    expect(body.requestId).toBeString();
  });
});

describe("request validation", () => {
  test("a body with an unknown field is a 400 problem", async () => {
    const res = await app.request("/api/strict", {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ name: "a", extra: 1 }),
    });
    expect(res.status).toBe(400);
    expect(res.headers.get("content-type")).toContain(PROBLEM_JSON);
    expect((await res.json()).code).toBe("validation_error");
  });

  test("a valid body reaches the handler", async () => {
    const res = await app.request("/api/strict", {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ name: "a" }),
    });
    expect(res.status).toBe(200);
  });

  test("a query over the maximum limit is a 400", async () => {
    expect((await app.request("/api/paged?limit=101")).status).toBe(400);
    expect((await (await app.request("/api/paged")).json()).limit).toBe(25);
  });
});

describe("HTTP security", () => {
  test("a mutation with a foreign Origin is a 403", async () => {
    const res = await app.request("/api/echo", {
      method: "POST",
      headers: jsonHeaders({ Origin: "https://evil.example" }),
      body: "{}",
    });
    expect(res.status).toBe(403);
    expect(res.headers.get("content-type")).toContain(PROBLEM_JSON);
  });

  test("a mutation with a cross-site Sec-Fetch-Site is a 403", async () => {
    const res = await app.request("/api/echo", {
      method: "POST",
      headers: jsonHeaders({ "Sec-Fetch-Site": "cross-site" }),
      body: "{}",
    });
    expect(res.status).toBe(403);
  });

  test("a same-origin form submission is a 415", async () => {
    const res = await app.request("/api/echo", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: CRM_ORIGIN,
        "Sec-Fetch-Site": "same-origin",
      },
      body: "a=1",
    });
    expect(res.status).toBe(415);
  });

  test("an empty-bodied mutation (Content-Length: 0) is not a 415", async () => {
    const res = await app.request("/api/echo", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
        "Content-Length": "0",
        Origin: CRM_ORIGIN,
        "Sec-Fetch-Site": "same-origin",
      },
      body: "",
    });
    expect(res.status).not.toBe(415);
  });

  test("a foreign form submission is a 403", async () => {
    const res = await app.request("/api/echo", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: "https://evil.example",
      },
      body: "a=1",
    });
    expect(res.status).toBe(403);
  });

  test("a body over 1 MB is a 413", async () => {
    const res = await app.request("/api/echo", {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ blob: "x".repeat(1024 * 1024 + 1) }),
    });
    expect(res.status).toBe(413);
    expect(res.headers.get("content-type")).toContain(PROBLEM_JSON);
  });

  test("a same-origin JSON mutation reaches the handler", async () => {
    const res = await app.request("/api/echo", {
      method: "POST",
      headers: jsonHeaders({ "Sec-Fetch-Site": "same-origin" }),
      body: "{}",
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ reached: true });
  });
});

describe("response headers", () => {
  test("every response carries X-Request-Id and no-store", async () => {
    for (const path of ["/api/ok", "/api/nope", "/api/errors/unexpected"]) {
      const res = await app.request(path);
      expect(res.headers.get("x-request-id")).toBeString();
      expect(res.headers.get("cache-control")).toBe("private, no-store");
      expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    }
  });

  test("a valid incoming request id is kept, an invalid one is replaced", async () => {
    const kept = await app.request("/api/ok", {
      headers: { "X-Request-Id": "abc-123" },
    });
    expect(kept.headers.get("x-request-id")).toBe("abc-123");
    const replaced = await app.request("/api/ok", {
      headers: { "X-Request-Id": "bad id!" },
    });
    expect(replaced.headers.get("x-request-id")).not.toBe("bad id!");
  });
});
