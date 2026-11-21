import { describe, expect, test } from "bun:test";
import type { PublicMinistriesDto, PublicMinistryDto } from "@ancla/contracts";
import type { PublicClient } from "../publicClient";
import { createMinistriesLoader, createMinistryLoader } from "./ministries";

const LIST: PublicMinistriesDto = {
  ministries: [
    {
      name: "Alabanza",
      slug: "alabanza",
      href: "/ministerios/alabanza",
      tagline: "Adoramos",
      color: "obra-red",
    },
  ],
  landing: [{ name: "Alabanza", tile: { kind: "color", tone: "ink" } }],
};
const DETAIL = { slug: "alabanza", name: "Alabanza" } as PublicMinistryDto;

interface Calls {
  list: string[];
  detail: { slug: string; locale: string }[];
}

function clientFor(options: {
  list?: (PublicMinistriesDto | Error)[];
  detail?: (PublicMinistryDto | null | Error)[];
  calls?: Calls;
}): PublicClient {
  const { list = [LIST], detail = [null], calls } = options;
  const log = calls ?? { list: [], detail: [] };
  const client: Pick<PublicClient, "getMinistries" | "getMinistry"> = {
    async getMinistries(locale: string) {
      const result = list[Math.min(log.list.length, list.length - 1)];
      log.list.push(locale);
      if (result instanceof Error) throw result;
      return result as PublicMinistriesDto;
    },
    async getMinistry(slug: string, locale: string) {
      const result = detail[Math.min(log.detail.length, detail.length - 1)];
      log.detail.push({ slug, locale });
      if (result instanceof Error) throw result;
      return result as PublicMinistryDto | null;
    },
  };
  return client as PublicClient;
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

describe("createMinistriesLoader", () => {
  test("returns the list and caches it per locale", async () => {
    const calls: Calls = { list: [], detail: [] };
    const { options } = loaderOptions(clientFor({ calls }), { now: 0 });
    const getMinistries = createMinistriesLoader(options);
    expect(await getMinistries("es")).toEqual(LIST);
    expect(await getMinistries("es")).toEqual(LIST);
    await getMinistries("en");
    expect(calls.list).toEqual(["es", "en"]);
  });

  test("before the first success serves empty lists", async () => {
    const { options, warnings } = loaderOptions(
      clientFor({ list: [new Error("down")] }),
      { now: 0 },
    );
    expect(await createMinistriesLoader(options)("es")).toEqual({
      ministries: [],
      landing: [],
    });
    expect(warnings).toHaveLength(1);
  });

  test("keeps the last good list when the API fails later", async () => {
    const clock = { now: 0 };
    const { options } = loaderOptions(
      clientFor({ list: [LIST, new Error("down")] }),
      clock,
    );
    const getMinistries = createMinistriesLoader(options);
    await getMinistries("es");
    clock.now = 61_000;
    expect(await getMinistries("es")).toEqual(LIST);
  });

  test("without a client serves empty lists and does not touch the network", async () => {
    const { options } = loaderOptions(null, { now: 0 });
    expect(await createMinistriesLoader(options)("pt")).toEqual({
      ministries: [],
      landing: [],
    });
  });
});

describe("createMinistryLoader", () => {
  test("asks the API by slug and locale and caches it", async () => {
    const calls: Calls = { list: [], detail: [] };
    const { options } = loaderOptions(clientFor({ detail: [DETAIL], calls }), {
      now: 0,
    });
    const getMinistry = createMinistryLoader(options);
    expect(await getMinistry("alabanza", "es")).toEqual(DETAIL);
    expect(await getMinistry("alabanza", "es")).toEqual(DETAIL);
    expect(calls.detail).toEqual([{ slug: "alabanza", locale: "es" }]);
  });

  test("a 404 is a successful answer: null, cached for the window", async () => {
    const calls: Calls = { list: [], detail: [] };
    const { options, warnings } = loaderOptions(
      clientFor({ detail: [null, DETAIL], calls }),
      { now: 0 },
    );
    const getMinistry = createMinistryLoader(options);
    expect(await getMinistry("nope", "es")).toBeNull();
    expect(await getMinistry("nope", "es")).toBeNull();
    expect(calls.detail).toHaveLength(1);
    expect(warnings).toHaveLength(0);
  });

  test("before the first success a failure is null", async () => {
    const { options, warnings } = loaderOptions(
      clientFor({ detail: [new Error("down")] }),
      { now: 0 },
    );
    expect(await createMinistryLoader(options)("alabanza", "es")).toBeNull();
    expect(warnings).toHaveLength(1);
  });

  test("without a client it is null", async () => {
    const { options } = loaderOptions(null, { now: 0 });
    expect(await createMinistryLoader(options)("alabanza", "es")).toBeNull();
  });
});
