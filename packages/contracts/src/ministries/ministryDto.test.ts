import { describe, expect, test } from "bun:test";
import {
  ministryLandingBody,
  ministryLeadersBody,
  ministrySettingsBody,
} from "./ministryDto";

const ID = (n: number) => `0197f1a0-0000-7000-8000-00000000000${n}`;
const settings = (overrides: Record<string, unknown> = {}) => ({
  version: 1,
  categoryId: null,
  destination: "page",
  icon: "alabanza",
  color: "obra-red",
  ...overrides,
});

describe("ministrySettingsBody", () => {
  test("accepts a page destination without URL", () => {
    expect(ministrySettingsBody.safeParse(settings()).success).toBe(true);
  });

  test("requires an https externalUrl for an external destination", () => {
    const external = settings({ destination: "external" });
    expect(ministrySettingsBody.safeParse(external).success).toBe(false);
    const http = { ...external, externalUrl: "http://a.org" };
    expect(ministrySettingsBody.safeParse(http).success).toBe(false);
    const https = { ...external, externalUrl: "https://a.org" };
    expect(ministrySettingsBody.safeParse(https).success).toBe(true);
  });

  test("rejects a financial field and values outside the catalogs", () => {
    expect(
      ministrySettingsBody.safeParse(settings({ budget: 5 })).success,
    ).toBe(false);
    expect(
      ministrySettingsBody.safeParse(settings({ icon: "nope" })).success,
    ).toBe(false);
    expect(
      ministrySettingsBody.safeParse(settings({ color: "#fff" })).success,
    ).toBe(false);
  });
});

describe("ministryLeadersBody", () => {
  const leader = (n: number) => ({
    personProfileId: ID(n),
    visible: true,
    order: n,
    translations: { es: { title: "Líder" } },
  });

  test("accepts up to 12 distinct people", () => {
    expect(ministryLeadersBody.safeParse([leader(1), leader(2)]).success).toBe(
      true,
    );
    expect(ministryLeadersBody.safeParse([]).success).toBe(true);
  });

  test("rejects a repeated person and more than 12", () => {
    expect(ministryLeadersBody.safeParse([leader(1), leader(1)]).success).toBe(
      false,
    );
    const many = Array.from({ length: 13 }, (_, n) => ({
      ...leader(1),
      personProfileId: `0197f1a0-0000-7000-8000-0000000000${String(n).padStart(2, "0")}`,
    }));
    expect(ministryLeadersBody.safeParse(many).success).toBe(false);
  });
});

describe("ministryLandingBody", () => {
  const tile = (overrides: Record<string, unknown> = {}) => ({
    id: ID(1),
    showOnLanding: true,
    landingOrder: 1,
    landingTile: "color",
    landingTone: "mist",
    ...overrides,
  });

  test("accepts color and photo tiles", () => {
    expect(ministryLandingBody.safeParse([tile()]).success).toBe(true);
    const photo = tile({
      id: ID(2),
      landingTile: "photo",
      landingPhotoId: ID(3),
    });
    expect(ministryLandingBody.safeParse([photo]).success).toBe(true);
  });

  test("rejects a photo tile without photo, an unknown tone and a repeated ministry", () => {
    expect(
      ministryLandingBody.safeParse([tile({ landingTile: "photo" })]).success,
    ).toBe(false);
    expect(
      ministryLandingBody.safeParse([tile({ landingTone: "blue" })]).success,
    ).toBe(false);
    expect(ministryLandingBody.safeParse([tile(), tile()]).success).toBe(false);
  });
});
