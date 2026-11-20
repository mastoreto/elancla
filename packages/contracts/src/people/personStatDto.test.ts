import { describe, expect, test } from "bun:test";
import { upsertPersonProfileBody } from "./personProfileDto";
import { personStatsDto } from "./personStatDto";

describe("personStatsDto", () => {
  test("accepts up to 4 stats within the length limits", () => {
    const stat = { label: "x".repeat(30), value: "y".repeat(20) };
    expect(personStatsDto.safeParse([stat, stat, stat, stat]).success).toBe(
      true,
    );
    expect(
      personStatsDto.safeParse([stat, stat, stat, stat, stat]).success,
    ).toBe(false);
  });

  test("rejects empty or oversized label and value", () => {
    expect(
      personStatsDto.safeParse([{ label: "x".repeat(31), value: "1" }]).success,
    ).toBe(false);
    expect(
      personStatsDto.safeParse([{ label: "L", value: "y".repeat(21) }]).success,
    ).toBe(false);
    expect(personStatsDto.safeParse([{ label: "", value: "1" }]).success).toBe(
      false,
    );
  });

  test("a role translation without stats defaults to none", () => {
    const parsed = upsertPersonProfileBody.parse({
      name: "Ana",
      photoId: null,
      userId: null,
      translations: {},
      roles: [
        {
          context: "blog-author",
          visible: true,
          order: 0,
          translations: { es: { title: "Autora" } },
        },
      ],
    });
    expect(parsed.roles[0]?.translations.es?.stats).toEqual([]);
  });
});
