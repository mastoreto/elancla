import { describe, expect, test } from "bun:test";
import { ministrySnapshot } from "./ministrySnapshot";

const ID = "0197f1a0-0000-7000-8000-000000000001";
const about = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Hola" }] }],
};
const translation = (overrides: Record<string, unknown> = {}) => ({
  name: "Alabanza",
  slug: "alabanza",
  tagline: "Cantar con entendimiento",
  about,
  ...overrides,
});
const snapshot = (overrides: Record<string, unknown> = {}) => ({
  translations: { es: translation() },
  ...overrides,
});
const ok = (value: unknown) => ministrySnapshot.safeParse(value).success;

describe("ministrySnapshot", () => {
  test("accepts a minimal profile and fills the defaults", () => {
    const parsed = ministrySnapshot.parse(snapshot());
    expect(parsed.translations.es?.values).toEqual([]);
  });

  test("accepts a complete profile", () => {
    expect(
      ok(
        snapshot({
          translations: {
            es: translation({
              values: [{ title: "Servicio", description: "Con alegría" }],
              place: "Salón principal",
              audience: "Todos",
              howToJoin: "Escribinos",
              nextStep: "Venir un ensayo",
              coverAlt: "Banda",
              seoTitle: "Alabanza",
              seoDescription: "Descripción",
            }),
            en: translation({ name: "Worship", slug: "worship" }),
          },
          coverMediaId: ID,
          socialImageId: ID,
        }),
      ),
    ).toBe(true);
  });

  test("turns blank optional texts into absent ones", () => {
    const parsed = ministrySnapshot.parse(
      snapshot({ translations: { es: translation({ place: "  " }) } }),
    );
    expect(parsed.translations.es?.place).toBeUndefined();
  });

  test.each([
    ["no languages", snapshot({ translations: {} })],
    ["a bad locale", snapshot({ translations: { ESP: translation() } })],
    [
      "an empty name",
      snapshot({ translations: { es: translation({ name: " " }) } }),
    ],
    [
      "a long name",
      snapshot({ translations: { es: translation({ name: "a".repeat(81) }) } }),
    ],
    [
      "an accented slug",
      snapshot({ translations: { es: translation({ slug: "enseñanza" }) } }),
    ],
    [
      "a long tagline",
      snapshot({
        translations: { es: translation({ tagline: "a".repeat(161) }) },
      }),
    ],
    [
      "seven values",
      snapshot({
        translations: {
          es: translation({
            values: Array.from({ length: 7 }, () => ({
              title: "t",
              description: "d",
            })),
          }),
        },
      }),
    ],
    ["a financial field", snapshot({ budget: 10 })],
    [
      "an unknown translation key",
      snapshot({ translations: { es: translation({ budget: 1 }) } }),
    ],
    ["a bad media id", snapshot({ coverMediaId: "x" })],
  ])("rejects %s", (_name, value) => {
    expect(ok(value)).toBe(false);
  });
});
