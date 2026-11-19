import { describe, expect, test } from "bun:test";
import {
  hasReachedSiteKeyLimit,
  MAX_ACTIVE_SITE_KEYS,
  SiteKeyLimitError,
} from "./siteKeyLimit";

describe("site key limit", () => {
  test("is reached at the maximum, not before", () => {
    expect(hasReachedSiteKeyLimit(MAX_ACTIVE_SITE_KEYS - 1)).toBe(false);
    expect(hasReachedSiteKeyLimit(MAX_ACTIVE_SITE_KEYS)).toBe(true);
  });

  test("the error is a 409 with its own code", () => {
    const error = new SiteKeyLimitError();
    expect(error.status).toBe(409);
    expect(error.code).toBe("site_key_limit");
  });
});
