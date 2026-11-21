import { describe, expect, test } from "bun:test";
import { ministryMediaIds } from "./ministryBeforeGoLive";

const A = "0190a000-0000-7000-8000-000000000001";
const B = "0190a000-0000-7000-8000-000000000002";

describe("ministryMediaIds", () => {
  test("gathers the cover and the social image", () => {
    expect(ministryMediaIds({ coverMediaId: A, socialImageId: B })).toEqual([
      A,
      B,
    ]);
  });

  test("a profile without images references nothing", () => {
    expect(ministryMediaIds({ translations: {} })).toEqual([]);
    expect(ministryMediaIds({ socialImageId: B })).toEqual([B]);
  });
});
