import { describe, expect, test } from "bun:test";
import { pickLocalized } from "./pickLocalized";

describe("pickLocalized", () => {
  test("prefers the default language", () => {
    expect(pickLocalized({ en: { name: "Youth" }, es: { name: "Jóvenes" } }, "es")).toBe("Jóvenes");
  });

  test("falls back to the first language, then to the fallback", () => {
    expect(pickLocalized({ en: { name: "Youth" } }, "es")).toBe("Youth");
    expect(pickLocalized({}, "es")).toBe("Sin nombre");
    expect(pickLocalized({}, "es", "—")).toBe("—");
  });
});
