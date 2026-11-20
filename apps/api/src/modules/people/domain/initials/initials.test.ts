import { describe, expect, test } from "bun:test";
import { initials } from "./initials";

describe("initials", () => {
  test.each([
    ["María José Pérez", "MP"],
    ["Pr. Juan Olivera", "JO"],
    ["Dra. Ana Gómez", "AG"],
    ["Álvaro Núñez", "AN"],
    ["  ana   lópez  ", "AL"],
    ["Santiago", "S"],
    ["Pr. Juan", "J"],
    ["", ""],
    ["   ", ""],
    ["Pr.", ""],
    ["Ana - Pérez", "AP"],
  ])("%j -> %j", (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});
