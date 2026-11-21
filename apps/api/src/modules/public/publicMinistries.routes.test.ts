import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  type PublicMinistriesDto,
  type PublicMinistryDto,
  publicMinistriesDto,
  publicMinistryDto,
} from "@ancla/contracts";
import { createApiCaller } from "../../../test/support/apiCaller";
import { createFixtures } from "../../../test/support/fixtures";
import {
  createMinistryWorld,
  type MinistryWorld,
} from "../../../test/support/ministryWorld";
import { PUBLIC_CACHE_CONTROL } from "./public.routes";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const EXTERNAL_URL = "https://mujer.example.org/";

let world: MinistryWorld;

const get = (path: string, query = "", key = world.key) =>
  call("GET", `/public/v1/${world.slug}/ministries${path}${query}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
const listOf = async (query = ""): Promise<PublicMinistriesDto> => {
  const res = await get("", query);
  expect(res.status).toBe(200);
  return publicMinistriesDto.parse(await res.json());
};
const detailOf = async (
  slug: string,
  query = "",
): Promise<PublicMinistryDto> => {
  const res = await get(`/${slug}`, query);
  expect(res.status).toBe(200);
  return publicMinistryDto.parse(await res.json());
};

/** Keys and values that would leak an internal id; an image URL names its public file by design. */
function findLeaks(value: unknown, path = "$"): string[] {
  if (typeof value === "string") return UUID_PATTERN.test(value) ? [path] : [];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findLeaks(item, `${path}[${index}]`));
  }
  if (value === null || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => {
    if (key === "url") return [];
    const own = /^id$|Id$/.test(key) ? [`${path}.${key}`] : [];
    return [...own, ...findLeaks(child, `${path}.${key}`)];
  });
}

beforeAll(async () => {
  world = await createMinistryWorld(fixtures);
  const category = await world.createCategory({ es: "Crecer", en: "Grow" });
  const photo = await world.createMedia();
  const cover = await world.createMedia();
  const social = await world.createMedia();
  const pending = await world.createMedia("pending");

  await world.createMinistry({
    slugs: { es: "alabanza", en: "worship" },
    icon: "alabanza",
    color: "obra-red",
    categoryId: category,
    showOnLanding: true,
    landingOrder: 2,
    coverMediaId: cover,
    leaders: [
      {
        name: "Ana Líder",
        visible: true,
        order: 1,
        title: "Líder",
        bio: "Bio",
      },
      { name: "Beto Oculto", visible: false },
    ],
  });
  await world.createMinistry({
    slugs: { es: "ensenanza" },
    showOnLanding: true,
    landingOrder: 1,
    landingTile: "PHOTO",
    landingPhotoId: photo,
  });
  await world.createMinistry({ slugs: { es: "borrador" }, state: "DRAFT" });
  await world.createMinistry({ slugs: { es: "pausado" }, state: "PAUSED" });
  await world.createMinistry({
    slugs: { es: "oracion" },
    destination: "NONE",
    showOnLanding: true,
    landingOrder: 3,
    landingTone: "ink",
  });
  await world.createMinistry({
    slugs: { es: "espacio-mujer" },
    destination: "EXTERNAL",
    externalUrl: EXTERNAL_URL,
  });
  await world.createMinistry({
    slugs: { es: "seo" },
    seo: { seoTitle: "Título SEO", seoDescription: "Descripción SEO" },
    socialImageId: social,
    coverMediaId: cover,
    landingTile: "PHOTO",
    landingPhotoId: pending,
    showOnLanding: true,
    landingOrder: 4,
  });
});

afterAll(async () => {
  await world.cleanup();
  await fixtures.cleanup();
});

describe("GET /public/v1/:churchSlug/ministries", () => {
  test("lists only the published ministries, with cache policy and no internal ids", async () => {
    const res = await get("");
    expect(res.headers.get("Cache-Control")).toBe(PUBLIC_CACHE_CONTROL);
    const raw = await res.json();
    expect(findLeaks(raw)).toEqual([]);
    const list = publicMinistriesDto.parse(raw);
    expect(list.ministries.map((entry) => entry.name).sort()).toEqual(
      [
        "Nombre alabanza",
        "Nombre ensenanza",
        "Nombre espacio-mujer",
        "Nombre oracion",
        "Nombre seo",
      ].sort(),
    );
  });

  test("a draft and a paused profile are absent from the list and the detail is a 404", async () => {
    const names = (await listOf()).ministries.map((entry) => entry.name);
    expect(names).not.toContain("Nombre borrador");
    expect(names).not.toContain("Nombre pausado");
    expect((await get("/borrador")).status).toBe(404);
    expect((await get("/pausado")).status).toBe(404);
  });

  test("a ministry without a page is listed without href and its detail is a 404", async () => {
    const { ministries } = await listOf();
    const prayer = ministries.find((entry) => entry.name === "Nombre oracion");
    expect(prayer).toBeDefined();
    expect(prayer?.href).toBeUndefined();
    expect(prayer?.slug).toBeUndefined();
    expect((await get("/oracion")).status).toBe(404);
  });

  test("an external ministry links to its URL and has no page", async () => {
    const { ministries } = await listOf();
    const external = ministries.find(
      (entry) => entry.name === "Nombre espacio-mujer",
    );
    expect(external?.href).toBe(EXTERNAL_URL);
    expect(external?.slug).toBeUndefined();
    expect((await get("/espacio-mujer")).status).toBe(404);
  });

  test("the page links follow the language prefix of the site", async () => {
    const es = (await listOf()).ministries.find(
      (entry) => entry.slug === "alabanza",
    );
    expect(es?.href).toBe("/ministerios/alabanza");
    const en = (await listOf("?locale=en")).ministries.find(
      (entry) => entry.slug === "worship",
    );
    expect(en?.href).toBe("/en/ministerios/worship");
    expect(en?.name).toBe("Nombre worship");
  });

  test("carries icon, color and the category name in the served language", async () => {
    const es = (await listOf()).ministries.find(
      (entry) => entry.slug === "alabanza",
    );
    expect(es).toMatchObject({
      icon: "alabanza",
      color: "obra-red",
      category: "Crecer",
      tagline: "Frase alabanza",
    });
    const en = (await listOf("?locale=en")).ministries.find(
      (entry) => entry.slug === "worship",
    );
    expect(en?.category).toBe("Grow");
  });

  test("the mosaic holds only the ministries shown on the landing, in order", async () => {
    const { landing } = await listOf();
    expect(landing.map((tile) => tile.name)).toEqual([
      "Nombre ensenanza",
      "Nombre alabanza",
      "Nombre oracion",
      "Nombre seo",
    ]);
    const [photo, , prayer, notReady] = landing;
    expect(photo?.tile.kind).toBe("photo");
    if (photo?.tile.kind === "photo") {
      expect(photo.tile.image.width).toBe(800);
    }
    expect(prayer?.tile).toEqual({ kind: "color", tone: "ink" });
    expect(prayer?.href).toBeUndefined();
    // A photo that is not ready falls back to the color tile instead of a broken image.
    expect(notReady?.tile).toEqual({ kind: "color", tone: "mist" });
  });

  test("a ministry hidden from the landing is out of the mosaic but still listed", async () => {
    const list = await listOf();
    expect(list.landing.map((tile) => tile.name)).not.toContain(
      "Nombre espacio-mujer",
    );
    expect(list.ministries.map((entry) => entry.name)).toContain(
      "Nombre espacio-mujer",
    );
  });

  test("requires the site key and a valid locale", async () => {
    expect((await get("", "", "ancla_pk_nope")).status).toBe(401);
    expect((await get("", "?locale=NOPE!")).status).toBe(400);
  });
});

describe("GET /public/v1/:churchSlug/ministries/:slug", () => {
  test("serves the detail with the visible leaders only, without ids", async () => {
    const res = await get("/alabanza");
    const raw = await res.json();
    expect(findLeaks(raw)).toEqual([]);
    const detail = publicMinistryDto.parse(raw);
    expect(detail.leaders).toEqual([
      expect.objectContaining({
        name: "Ana Líder",
        title: "Líder",
        bio: "Bio",
      }),
    ]);
    expect(JSON.stringify(raw)).not.toContain("Beto Oculto");
    expect(detail.cover?.image.url).toContain(".webp");
  });

  test("the slug works in any of the languages the profile has", async () => {
    const byEnglishSlug = await detailOf("worship", "?locale=en");
    expect(byEnglishSlug.slug).toBe("worship");
    expect(byEnglishSlug.locale).toBe("en");
    const spanishPage = await detailOf("alabanza", "?locale=en");
    expect(spanishPage.locale).toBe("en");
  });

  test("falls back to the default language and lists only the languages it has", async () => {
    const detail = await detailOf("ensenanza", "?locale=en");
    expect(detail.locale).toBe("es");
    expect(detail.name).toBe("Nombre ensenanza");
    expect(detail.alternates).toEqual({ es: "ensenanza" });

    const both = await detailOf("alabanza");
    expect(both.alternates).toEqual({ es: "alabanza", en: "worship" });
  });

  test("resolves the SEO: the own texts and the social image, else the profile's", async () => {
    const own = await detailOf("seo");
    expect(own.seo.title).toBe("Título SEO");
    expect(own.seo.description).toBe("Descripción SEO");
    expect(own.seo.image).toBeDefined();

    const plain = await detailOf("alabanza");
    expect(plain.seo.title).toBe("Nombre alabanza");
    expect(plain.seo.description).toBe("Frase alabanza");
    expect(plain.seo.image?.url).toBe(plain.cover?.image.url);
  });

  test("an unknown slug is a 404", async () => {
    expect((await get("/no-existe")).status).toBe(404);
  });
});
