import { describe, expect, test } from "bun:test";
import type { PersonProfileDto } from "@ancla/contracts";
import { toPersonFormValues, toUpsertPersonBody } from "./personFormValues";

const LOCALES = ["es", "en", "pt"] as const;
const ID = "11111111-1111-4111-8111-111111111111";

const person: PersonProfileDto = {
  id: ID,
  name: "Ana Pérez",
  photo: null,
  userId: null,
  translations: { es: { bio: "Sirve desde 2010." }, en: { bio: null } },
  roles: [
    {
      context: "team",
      visible: false,
      order: 3,
      translations: { es: { title: "Pastora", stats: [] }, en: { title: "Pastor", stats: [] } },
    },
    {
      context: "preacher",
      visible: true,
      order: 1,
      translations: { es: { title: "Predicadora", stats: [] } },
    },
  ],
};

describe("toPersonFormValues", () => {
  test("a blank profile starts visible, first in order and without roles of other contexts", () => {
    const values = toPersonFormValues(null, LOCALES);
    expect(values).toMatchObject({ name: "", photo: null, userId: null, otherRoles: [] });
    expect(values.team).toEqual({
      visible: true,
      order: "0",
      titles: { es: "", en: "", pt: "" },
    });
  });

  test("fills every locale, with empty text where the person has none", () => {
    const values = toPersonFormValues(person, LOCALES);
    expect(values.bios).toEqual({ es: "Sirve desde 2010.", en: "", pt: "" });
    expect(values.team).toEqual({
      visible: false,
      order: "3",
      titles: { es: "Pastora", en: "Pastor", pt: "" },
    });
  });

  test("keeps the roles of other contexts apart from the team one", () => {
    expect(toPersonFormValues(person, LOCALES).otherRoles.map((role) => role.context)).toEqual([
      "preacher",
    ]);
  });
});

describe("toUpsertPersonBody", () => {
  test("round trips: the unedited form reproduces the profile, other roles included", () => {
    const body = toUpsertPersonBody(toPersonFormValues(person, LOCALES), LOCALES);
    expect(body.roles).toEqual([person.roles[1], person.roles[0]]);
    expect(body.translations).toEqual({
      es: { bio: "Sirve desde 2010." },
      en: { bio: null },
      pt: { bio: null },
    });
  });

  test("trims the name, nulls blank text and drops empty titles", () => {
    const values = toPersonFormValues(null, LOCALES);
    values.name = "  Luis  ";
    values.bios.es = "   ";
    values.team.titles = { es: " Diácono ", en: "", pt: "  " };
    const body = toUpsertPersonBody(values, LOCALES);
    expect(body.name).toBe("Luis");
    expect(body.translations.es).toEqual({ bio: null });
    expect(body.roles).toEqual([
      {
        context: "team",
        visible: true,
        order: 0,
        translations: { es: { title: "Diácono", stats: [] } },
      },
    ]);
  });

  test("without any title the team role is removed but the other roles stay", () => {
    const values = toPersonFormValues(person, LOCALES);
    values.team.titles = { es: "", en: "", pt: "" };
    expect(toUpsertPersonBody(values, LOCALES).roles).toEqual([person.roles[1]]);
  });

  test("sends the photo id and the linked user", () => {
    const values = toPersonFormValues(person, LOCALES);
    values.userId = ID;
    expect(toUpsertPersonBody(values, LOCALES)).toMatchObject({ photoId: null, userId: ID });
  });
});
