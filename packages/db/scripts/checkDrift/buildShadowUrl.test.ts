import { expect, test } from "bun:test";
import { buildShadowUrl } from "./buildShadowUrl";

test("keeps host and credentials and swaps the database", () => {
  expect(
    buildShadowUrl("postgresql://app_migrator:pw@localhost:5434/ancla"),
  ).toBe("postgresql://app_migrator:pw@localhost:5434/ancla_shadow");
});
