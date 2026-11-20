import { describe, expect, test } from "bun:test";
import type { PersonProfileDto } from "@ancla/contracts";
import { summarizePersonRoles } from "./summarizePersonRoles";

const person: PersonProfileDto = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Ana",
  photo: null,
  userId: null,
  translations: {},
  roles: [
    { context: "team", visible: true, order: 0, translations: { es: { title: "Pastora" } } },
    { context: "preacher", visible: false, order: 0, translations: { en: { title: "Preacher" } } },
  ],
};

describe("summarizePersonRoles", () => {
  test("uses the default language title and keeps the visibility", () => {
    expect(summarizePersonRoles(person, "es")[0]).toEqual({
      context: "team",
      title: "Pastora",
      visible: true,
    });
  });

  test("falls back to another language when the default one is missing", () => {
    expect(summarizePersonRoles(person, "es")[1]).toEqual({
      context: "preacher",
      title: "Preacher",
      visible: false,
    });
  });
});
