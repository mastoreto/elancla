import { expect, test } from "bun:test";
import { formatDuration } from "./formatDuration";

test("formats short, medium and long durations", () => {
  expect(formatDuration(2100)).toBe("2.1s");
  expect(formatDuration(41_000)).toBe("41s");
  expect(formatDuration(65_000)).toBe("1m05s");
});
