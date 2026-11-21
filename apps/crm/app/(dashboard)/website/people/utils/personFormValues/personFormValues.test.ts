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
      stats: { es: [], en: [], pt: [] },
    });
    expect(values.blogAuthor.titles).toEqual({ es: "", en: "", pt: "" });
  });

  test("fills every locale, with empty text where the person has none", () => {
    const values = toPersonFormValues(person, LOCALES);
    expect(values.bios).toEqual({ es: "Sirve desde 2010.", en: "", pt: "" });
    expect(values.team).toEqual({
      visible: false,
      order: "3",
      titles: { es: "Pastora", en: "Pastor", pt: "" },
      stats: { es: [], en: [], pt: [] },
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

  test("the blog author role is edited apart and keeps stats by language", () => {
    const stats = [{ label: "Años", value: "12" }];
    const withAuthor: PersonProfileDto = {
      ...person,
      roles: [
        ...person.roles,
        {
          context: "blog-author",
          visible: true,
          order: 2,
          translations: { es: { title: "Autora", stats } },
        },
      ],
    };
    const values = toPersonFormValues(withAuthor, LOCALES);
    expect(values.blogAuthor).toMatchObject({ order: "2", titles: { es: "Autora" } });
    expect(values.blogAuthor.stats.es).toEqual(stats);
    expect(values.otherRoles.map((role) => role.context)).toEqual(["preacher"]);
    const body = toUpsertPersonBody(values, LOCALES);
    expect(body.roles).toEqual([withAuthor.roles[1], withAuthor.roles[0], withAuthor.roles[2]]);
  });

  test("blank stat rows are dropped, the rest trimmed; a stat-less title sends none", () => {
    const values = toPersonFormValues(null, LOCALES);
    values.blogAuthor.titles = { es: "Autor", en: "Author", pt: "" };
    values.blogAuthor.stats = {
      es: [
        { label: " Años ", value: " 12 " },
        { label: " ", value: "" },
      ],
      en: [],
      pt: [{ label: "x", value: "y" }],
    };
    const [role] = toUpsertPersonBody(values, LOCALES).roles;
    expect(role?.context).toBe("blog-author");
    expect(role?.translations.es?.stats).toEqual([{ label: "Años", value: "12" }]);
    expect(role?.translations.en?.stats).toEqual([]);
    expect(role?.translations.pt).toBeUndefined();
  });

  test("a team role with stats keeps them on save; clearing the blog titles removes that role", () => {
    const stats = [{ label: "Años", value: "12" }];
    const withStats: PersonProfileDto = {
      ...person,
      roles: [
        {
          context: "team",
          visible: true,
          order: 1,
          translations: { es: { title: "Pastora", stats } },
        },
      ],
    };
    const body = toUpsertPersonBody(toPersonFormValues(withStats, LOCALES), LOCALES);
    expect(body.roles[0]?.translations.es?.stats).toEqual(stats);
    expect(body.roles.some((role) => role.context === "blog-author")).toBe(false);
  });

  test("sends the photo id and the linked user", () => {
    const values = toPersonFormValues(person, LOCALES);
    values.userId = ID;
    expect(toUpsertPersonBody(values, LOCALES)).toMatchObject({ photoId: null, userId: ID });
  });
});
