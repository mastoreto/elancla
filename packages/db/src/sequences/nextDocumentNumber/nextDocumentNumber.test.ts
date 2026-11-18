import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "../../client";
import { nextDocumentNumber } from "./nextDocumentNumber";

const CONCURRENT_CALLS = 50;
let organizationId = "";

beforeAll(async () => {
  const organization = await db.organization.create({
    data: {
      slug: `test-sequences-${crypto.randomUUID()}`,
      name: "Sequence test",
      country: "UY",
      timezone: "America/Montevideo",
      defaultLocale: "es",
      locales: ["es"],
      currencies: ["UYU"],
    },
  });
  organizationId = organization.id;
});

afterAll(async () => {
  await db.organization.delete({ where: { id: organizationId } });
  await db.$disconnect();
});

describe("nextDocumentNumber", () => {
  test("concurrent callers get 1..N without gaps or repeats", async () => {
    const numbers = await Promise.all(
      Array.from({ length: CONCURRENT_CALLS }, () =>
        db.$transaction((tx) =>
          nextDocumentNumber(tx, { organizationId, type: "MOV", year: 2026 }),
        ),
      ),
    );
    const sorted = [...numbers].sort((a, b) => a - b);
    expect(sorted).toEqual(
      Array.from({ length: CONCURRENT_CALLS }, (_, index) => index + 1),
    );
  });

  test("a rolled back transaction releases its number", async () => {
    const input = { organizationId, type: "OC", year: 2026 };
    await db.$transaction((tx) => nextDocumentNumber(tx, input));
    await expect(
      db.$transaction(async (tx) => {
        await nextDocumentNumber(tx, input);
        throw new Error("rollback");
      }),
    ).rejects.toThrow("rollback");
    expect(await db.$transaction((tx) => nextDocumentNumber(tx, input))).toBe(
      2,
    );
  });

  test("numbers restart per type and year", async () => {
    expect(
      await nextDocumentNumber(db, { organizationId, type: "MOV", year: 2027 }),
    ).toBe(1);
  });
});
