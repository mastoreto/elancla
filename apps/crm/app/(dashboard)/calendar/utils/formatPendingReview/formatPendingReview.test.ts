import { describe, expect, test } from "bun:test";
import { formatPendingReview } from "./formatPendingReview";

describe("formatPendingReview", () => {
  test("names the weekday, the hour and the title in the default language", () => {
    const review = {
      weekday: 0,
      start: "10:00",
      translations: { en: { title: "Worship" }, es: { title: "Culto" } },
    };
    expect(formatPendingReview(review, "es")).toEqual({ title: "Culto", when: "Domingo 10:00" });
  });

  test("falls back to another language", () => {
    const review = { weekday: 3, start: "19:30", translations: { en: { title: "Prayer" } } };
    expect(formatPendingReview(review, "es")).toEqual({ title: "Prayer", when: "Miércoles 19:30" });
  });
});
