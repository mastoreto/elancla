import { describe, expect, test } from "bun:test";
import { clientAddress } from "./clientAddress";

describe("clientAddress", () => {
  test("takes the first forwarded hop", () => {
    expect(clientAddress("203.0.113.7, 10.0.0.1")).toBe("203.0.113.7");
  });

  test("is null when there is no header or it is blank", () => {
    expect(clientAddress(undefined)).toBeNull();
    expect(clientAddress("  ")).toBeNull();
  });
});
