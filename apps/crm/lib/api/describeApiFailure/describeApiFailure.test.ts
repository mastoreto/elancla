import { describe, expect, test } from "bun:test";
import { describeApiFailure } from "./describeApiFailure";

describe("describeApiFailure", () => {
  test("a 409 says what the screen means by it", () => {
    expect(describeApiFailure(409, "Ya existe")).toBe("Ya existe");
  });

  test("known statuses get their own message and the rest a generic one", () => {
    expect(describeApiFailure(403, "x")).toContain("rol");
    expect(describeApiFailure(404, "x")).toContain("Recarga");
    expect(describeApiFailure(400, "x")).toContain("Revisa");
    expect(describeApiFailure(500, "x")).toContain("No se pudo");
  });
});
