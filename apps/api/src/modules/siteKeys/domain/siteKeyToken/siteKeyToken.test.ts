import { describe, expect, test } from "bun:test";
import {
  formatSiteKey,
  generateSiteKeySecret,
  parseSiteKey,
  siteKeyHint,
} from "./siteKeyToken";

const ID = "01900000-0000-7000-8000-000000000001";

describe("site key token", () => {
  test("formats and parses back, even when the secret contains underscores and dashes", () => {
    const secret = `${"a_b-".repeat(10)}abc`;
    expect(secret).toHaveLength(43);
    const key = formatSiteKey(ID, secret);
    expect(key).toBe(`sk_${ID}_${secret}`);
    expect(parseSiteKey(key)).toEqual({ id: ID, secret });
  });

  test("round-trips a generated secret", () => {
    const secret = generateSiteKeySecret();
    expect(parseSiteKey(formatSiteKey(ID, secret))).toEqual({ id: ID, secret });
  });

  test("rejects anything that is not exactly a key", () => {
    const secret = generateSiteKeySecret();
    const rejected = [
      "",
      "garbage",
      `sk_${ID}`,
      `sk_${ID}_short`,
      `pk_${ID}_${secret}`,
      `sk_not-a-uuid_${secret}`,
      ` sk_${ID}_${secret}`,
      `sk_${ID}_${secret}x`,
    ];
    for (const raw of rejected) expect(parseSiteKey(raw)).toBeNull();
  });

  test("the hint shows the prefix and the start of the id only", () => {
    expect(siteKeyHint(ID)).toBe("sk_01900000…");
  });
});
