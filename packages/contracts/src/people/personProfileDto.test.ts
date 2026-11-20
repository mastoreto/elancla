import { describe, expect, test } from "bun:test";
import { upsertPersonProfileBody } from "./personProfileDto";

const role = (context: string) => ({
  context,
  visible: true,
  order: 0,
  translations: { es: { title: "Pastor" } },
});
const body = (roles: unknown[]) => ({
  name: "Ana",
  photoId: null,
  userId: null,
  translations: {},
  roles,
});

describe("upsertPersonProfileBody", () => {
  test("accepts one role per context", () => {
    expect(
      upsertPersonProfileBody.safeParse(body([role("team"), role("preacher")]))
        .success,
    ).toBe(true);
  });

  test("rejects a repeated context", () => {
    expect(
      upsertPersonProfileBody.safeParse(body([role("team"), role("team")]))
        .success,
    ).toBe(false);
  });

  test("rejects an unknown context and an empty title", () => {
    expect(
      upsertPersonProfileBody.safeParse(body([role("nope")])).success,
    ).toBe(false);
    const empty = { ...role("team"), translations: { es: { title: " " } } };
    expect(upsertPersonProfileBody.safeParse(body([empty])).success).toBe(
      false,
    );
  });
});
