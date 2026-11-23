import { describe, expect, test } from "bun:test";
import type { GoLiveContext } from "../../editorialTypes";
import { InvalidMediaError } from "../errors";
import { assertMediaValid } from "./assertMediaValid";

const ORGANIZATION_ID = "org-1";

/** A transaction whose `count` answers `found` and remembers the filter it was given. */
function fakeContext(found: number) {
  const filters: unknown[] = [];
  const tx = {
    mediaFile: {
      count: async ({ where }: { where: unknown }) => {
        filters.push(where);
        return found;
      },
    },
  } as unknown as GoLiveContext["tx"];
  return { ctx: { tx, organizationId: ORGANIZATION_ID }, filters };
}

describe("assertMediaValid", () => {
  test("checks content images unless told otherwise", async () => {
    const { ctx, filters } = fakeContext(1);
    await assertMediaValid(ctx, ["a"], "bad");
    expect(filters).toEqual([
      {
        id: { in: ["a"] },
        organizationId: ORGANIZATION_ID,
        purpose: "contentImage",
        status: "ready",
      },
    ]);
  });

  test("checks the purpose it is given, counting duplicated ids once", async () => {
    const { ctx, filters } = fakeContext(1);
    await assertMediaValid(ctx, ["a", "a"], "bad", "contentDocument");
    expect(filters[0]).toMatchObject({
      id: { in: ["a"] },
      purpose: "contentDocument",
    });
  });

  test("400 invalid_media when a file is missing, of another purpose or not ready", async () => {
    const { ctx } = fakeContext(1);
    await expect(
      assertMediaValid(ctx, ["a", "b"], "bad", "contentDocument"),
    ).rejects.toBeInstanceOf(InvalidMediaError);
  });

  test("an empty list needs no query", async () => {
    const { ctx, filters } = fakeContext(0);
    await assertMediaValid(ctx, [], "bad", "contentDocument");
    expect(filters).toEqual([]);
  });
});
