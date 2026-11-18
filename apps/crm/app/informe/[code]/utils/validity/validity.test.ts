import { describe, expect, test } from "bun:test";
import { getValidityEndLabel } from "./validity";

describe("getValidityEndLabel", () => {
  test("reads the closing time", () => {
    expect(getValidityEndLabel("Hoy 10:30 – 14:00")).toBe("Hasta las 14:00");
  });

  test("returns null without an end time", () => {
    expect(getValidityEndLabel("Sin habilitar")).toBeNull();
  });
});
