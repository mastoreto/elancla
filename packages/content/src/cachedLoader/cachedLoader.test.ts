import { describe, expect, test } from "bun:test";
import { createCachedLoader } from "./cachedLoader";

function setup(results: Record<string, (string | Error)[]>) {
  const calls: string[] = [];
  const warnings: string[] = [];
  const clock = { now: 0 };
  const get = createCachedLoader<string>({
    load: async (key) => {
      const list = results[key] ?? [];
      const seen = calls.filter((call) => call === key).length;
      calls.push(key);
      const result = list[Math.min(seen, list.length - 1)] as string | Error;
      if (result instanceof Error) throw result;
      return result;
    },
    fallback: (key) => `fallback:${key}`,
    ttlMs: 60_000,
    now: () => clock.now,
    warn: (message) => warnings.push(message),
  });
  return { get, calls, warnings, clock };
}

describe("createCachedLoader", () => {
  test("the TTL avoids a second load and expires after the window", async () => {
    const { get, calls, clock } = setup({ es: ["a"] });
    await get("es");
    clock.now += 59_000;
    await get("es");
    expect(calls).toHaveLength(1);
    clock.now += 2_000;
    await get("es");
    expect(calls).toHaveLength(2);
  });

  test("keeps a last known good value per key", async () => {
    const { get, clock } = setup({
      es: ["es-ok", new Error("down")],
      en: [new Error("down")],
    });
    expect(await get("es")).toBe("es-ok");
    expect(await get("en")).toBe("fallback:en");
    clock.now += 61_000;
    expect(await get("es")).toBe("es-ok");
    expect(await get("en")).toBe("fallback:en");
  });

  test("a failing load is not retried inside the window and warns once", async () => {
    const { get, calls, warnings } = setup({ es: [new Error("down")] });
    await get("es");
    await get("es");
    await get("es");
    expect(calls).toHaveLength(1);
    expect(warnings).toHaveLength(1);
  });

  test("concurrent callers of one key share a single request, other keys do not", async () => {
    const { get, calls } = setup({ es: ["a"], en: ["b"] });
    await Promise.all([get("es"), get("es"), get("es"), get("en")]);
    expect(calls.sort()).toEqual(["en", "es"]);
  });

  test("serves the fallback until the first success", async () => {
    const { get, clock } = setup({ es: [new Error("down"), "ok"] });
    expect(await get("es")).toBe("fallback:es");
    clock.now += 61_000;
    expect(await get("es")).toBe("ok");
  });
});
