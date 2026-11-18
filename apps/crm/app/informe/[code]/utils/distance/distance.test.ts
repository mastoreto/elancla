import { describe, expect, test } from "bun:test";
import { distanceInMeters, formatDistance } from "./distance";

describe("distanceInMeters", () => {
  test("is zero for the same point", () => {
    const point = { latitude: -34.9, longitude: -56.16 };
    expect(distanceInMeters(point, point)).toBe(0);
  });

  test("measures roughly 111 km per degree of latitude", () => {
    const meters = distanceInMeters({ latitude: 0, longitude: 0 }, { latitude: 1, longitude: 0 });
    expect(Math.round(meters / 1000)).toBe(111);
  });
});

describe("formatDistance", () => {
  test("uses meters under a kilometer", () => {
    expect(formatDistance(849.6)).toBe("850 m");
  });

  test("uses kilometers with a decimal comma above it", () => {
    expect(formatDistance(2400)).toBe("2,4 km");
  });
});
