import { describe, expect, test } from "bun:test";
import { maskEmail } from "./maskEmail";

describe("maskEmail", () => {
  test("keeps the first letters and the domain suffix", () => {
    expect(maskEmail("maria@elancla.org")).toBe("m***@e***.org");
  });

  test("handles a host without a dot", () => {
    expect(maskEmail("a@localhost")).toBe("a***@l***");
  });
});
