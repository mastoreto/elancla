import { describe, expect, test } from "bun:test";
import { formatLongDate, getGreeting } from "./greeting";

describe("getGreeting", () => {
  test("greets by time of day", () => {
    expect(getGreeting(8)).toBe("Buenos días");
    expect(getGreeting(15)).toBe("Buenas tardes");
    expect(getGreeting(21)).toBe("Buenas noches");
  });
});

describe("formatLongDate", () => {
  test("writes weekday, day and month in Spanish", () => {
    expect(formatLongDate(new Date(2026, 10, 17))).toBe("martes 17 de noviembre");
  });
});
