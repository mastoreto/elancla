import { describe, expect, test } from "bun:test";
import {
  type ResolvableException,
  type ResolvableSet,
  resolveScheduleForDate,
} from "./resolveScheduleForDate";

const set = (
  id: string,
  overrides: Partial<ResolvableSet> = {},
): ResolvableSet => ({
  id,
  validFrom: null,
  validTo: null,
  isDefault: false,
  forcedActive: false,
  ...overrides,
});

const REGULAR = set("regular", { isDefault: true });
const SUMMER = set("summer", {
  validFrom: "2027-01-10",
  validTo: "2027-02-20",
});
const OPEN_ENDED = set("open", { validFrom: "2027-01-01" });
const CHRISTMAS = set("christmas", {
  validFrom: "2027-12-20",
  validTo: "2027-12-31",
});

const idOf = (
  date: string,
  sets: ResolvableSet[],
  exceptions: ResolvableException[] = [],
): string | null =>
  resolveScheduleForDate({ date, sets, exceptions }).set?.id ?? null;

describe("resolveScheduleForDate", () => {
  describe("validity windows", () => {
    const sets = [REGULAR, SUMMER];
    test.each([
      ["the day before the window", "2027-01-09", "regular"],
      ["the first day of the window", "2027-01-10", "summer"],
      ["a day inside the window", "2027-02-01", "summer"],
      ["the last day of the window", "2027-02-20", "summer"],
      ["the day after the window", "2027-02-21", "regular"],
    ])("%s", (_label, date, expected) => {
      expect(idOf(date, sets)).toBe(expected);
    });

    test("a set without any validity only takes part as default or forced", () => {
      const noWindow = set("manual");
      expect(idOf("2027-06-01", [REGULAR, noWindow])).toBe("regular");
    });

    test("an open-ended window covers every later date", () => {
      expect(idOf("2030-06-01", [REGULAR, OPEN_ENDED])).toBe("open");
      expect(idOf("2026-12-31", [REGULAR, OPEN_ENDED])).toBe("regular");
    });

    test("the shortest window wins when several cover the date", () => {
      const wide = set("wide", {
        validFrom: "2027-01-01",
        validTo: "2027-12-31",
      });
      const narrow = set("narrow", {
        validFrom: "2027-01-15",
        validTo: "2027-01-20",
      });
      expect(idOf("2027-01-16", [REGULAR, wide, narrow])).toBe("narrow");
      expect(idOf("2027-01-16", [REGULAR, narrow, wide])).toBe("narrow");
    });

    test("a closed window beats an open-ended one", () => {
      expect(idOf("2027-01-15", [REGULAR, OPEN_ENDED, SUMMER])).toBe("summer");
    });

    test("a one-day window covers exactly that day", () => {
      const oneDay = set("one", {
        validFrom: "2027-03-07",
        validTo: "2027-03-07",
      });
      expect(idOf("2027-03-07", [REGULAR, oneDay])).toBe("one");
      expect(idOf("2027-03-08", [REGULAR, oneDay])).toBe("regular");
    });
  });

  describe("manual switch", () => {
    test("forcedActive wins over the validity window", () => {
      const forced = set("forced", { forcedActive: true });
      expect(idOf("2027-01-15", [REGULAR, SUMMER, forced])).toBe("forced");
    });
  });

  describe("exceptions", () => {
    const noMeeting: ResolvableException = {
      date: "2027-12-25",
      replacementSetId: null,
    };

    test("a 'no meeting' exception resolves to no set, and says why", () => {
      const resolution = resolveScheduleForDate({
        date: "2027-12-25",
        sets: [REGULAR],
        exceptions: [noMeeting],
      });
      expect(resolution.set).toBeNull();
      expect(resolution.exception).toBe(noMeeting);
    });

    test("an exception with a replacement resolves to that set", () => {
      const replaced: ResolvableException = {
        date: "2027-12-25",
        replacementSetId: "christmas",
      };
      expect(idOf("2027-12-25", [REGULAR, CHRISTMAS], [replaced])).toBe(
        "christmas",
      );
    });

    test("an exception beats the forced set and the window", () => {
      const forced = set("forced", { forcedActive: true });
      expect(
        idOf("2027-12-25", [REGULAR, forced, CHRISTMAS], [noMeeting]),
      ).toBeNull();
    });

    test("an exception only affects its own date", () => {
      expect(idOf("2027-12-26", [REGULAR], [noMeeting])).toBe("regular");
    });

    test("a replacement that no longer exists resolves to no set", () => {
      const dangling: ResolvableException = {
        date: "2027-12-25",
        replacementSetId: "gone",
      };
      expect(idOf("2027-12-25", [REGULAR], [dangling])).toBeNull();
    });
  });

  test("without a default set nothing applies outside the windows", () => {
    expect(idOf("2027-06-01", [SUMMER])).toBeNull();
    expect(idOf("2027-06-01", [])).toBeNull();
  });
});
