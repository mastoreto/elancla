import { describe, expect, test } from "bun:test";
import { uuidV7 } from "./uuidV7";

const UUID_V7_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("uuidV7", () => {
  test("has the version and variant bits of RFC 9562", () => {
    expect(uuidV7()).toMatch(UUID_V7_PATTERN);
  });

  test("sorts by creation time", () => {
    const earlier = uuidV7(1_700_000_000_000);
    const later = uuidV7(1_700_000_000_001);
    expect(earlier < later).toBe(true);
  });

  test("encodes the timestamp in the first 48 bits", () => {
    const id = uuidV7(0x0123_4567_89ab);
    expect(id.replace("-", "").slice(0, 12)).toBe("0123456789ab");
  });
});
