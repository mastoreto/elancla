import { describe, expect, test } from "bun:test";
import { pickTitle } from "./pickTitle";

describe("pickTitle", () => {
  test("prefers the default language", () => {
    expect(pickTitle({ en: "Camp", es: "Campamento" }, "es")).toBe("Campamento");
  });

  test("falls back to another language, then to the untitled label", () => {
    expect(pickTitle({ en: "Camp" }, "es")).toBe("Camp");
    expect(pickTitle({ es: "" }, "es")).toBe("Sin título");
    expect(pickTitle({}, "es")).toBe("Sin título");
  });
});
