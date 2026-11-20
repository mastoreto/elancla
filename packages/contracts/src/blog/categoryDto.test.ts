import { describe, expect, test } from "bun:test";
import { updateCategoryBody, upsertCategoryBody } from "./categoryDto";
import { updateSeriesBody, upsertSeriesBody } from "./seriesDto";

describe("category bodies", () => {
  const body = {
    order: 1,
    translations: { es: { name: "Guías", slug: "guias" } },
  };

  test("create has no version and update requires it", () => {
    expect(upsertCategoryBody.safeParse(body).success).toBe(true);
    expect(upsertCategoryBody.safeParse({ ...body, version: 1 }).success).toBe(
      false,
    );
    expect(updateCategoryBody.safeParse(body).success).toBe(false);
    expect(updateCategoryBody.safeParse({ ...body, version: 1 }).success).toBe(
      true,
    );
  });

  test("rejects an empty translation map, a long name and a bad slug", () => {
    expect(
      upsertCategoryBody.safeParse({ ...body, translations: {} }).success,
    ).toBe(false);
    const name = "x".repeat(61);
    expect(
      upsertCategoryBody.safeParse({
        ...body,
        translations: { es: { name, slug: "a" } },
      }).success,
    ).toBe(false);
    expect(
      upsertCategoryBody.safeParse({
        ...body,
        translations: { es: { name: "A", slug: "A B" } },
      }).success,
    ).toBe(false);
  });
});

describe("series bodies", () => {
  const body = {
    translations: {
      es: { name: "Hebreos", slug: "hebreos", description: null },
    },
  };

  test("create has no version and update requires it", () => {
    expect(upsertSeriesBody.safeParse(body).success).toBe(true);
    expect(updateSeriesBody.safeParse(body).success).toBe(false);
    expect(updateSeriesBody.safeParse({ ...body, version: 2 }).success).toBe(
      true,
    );
  });

  test("bounds name and description", () => {
    const translation = (overrides: Record<string, unknown>) => ({
      translations: {
        es: { name: "H", slug: "h", description: null, ...overrides },
      },
    });
    expect(
      upsertSeriesBody.safeParse(translation({ name: "x".repeat(81) })).success,
    ).toBe(false);
    expect(
      upsertSeriesBody.safeParse(translation({ description: "x".repeat(301) }))
        .success,
    ).toBe(false);
  });
});
