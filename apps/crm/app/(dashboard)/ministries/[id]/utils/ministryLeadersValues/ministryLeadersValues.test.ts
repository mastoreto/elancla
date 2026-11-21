import { describe, expect, test } from "bun:test";
import type { PersonProfileDto } from "@ancla/contracts";
import {
  blankLeaderRow,
  hasLeaderErrors,
  nextLeaderOrder,
  toMinistryLeaderRows,
  toMinistryLeadersBody,
  validateMinistryLeaders,
} from "./ministryLeadersValues";

const LOCALES = ["es", "en"];
const MINISTRY_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_MINISTRY_ID = "22222222-2222-4222-8222-222222222222";

function person(id: string, roles: PersonProfileDto["ministryRoles"]): PersonProfileDto {
  return {
    id,
    name: id,
    photo: null,
    userId: null,
    translations: {},
    roles: [],
    ministryRoles: roles,
  };
}

const people = [
  person("33333333-3333-4333-8333-333333333333", [
    {
      ministryId: MINISTRY_ID,
      ministryName: "Alabanza",
      visible: true,
      order: 2,
      translations: { es: { title: "Directora", stats: [] } },
    },
    {
      ministryId: OTHER_MINISTRY_ID,
      ministryName: "Jóvenes",
      visible: false,
      order: 0,
      translations: { es: { title: "Apoyo", stats: [] } },
    },
  ]),
  person("44444444-4444-4444-8444-444444444444", [
    {
      ministryId: MINISTRY_ID,
      ministryName: "Alabanza",
      visible: false,
      order: 1,
      translations: {
        es: { title: "Coordinador", stats: [] },
        en: { title: "Coordinator", stats: [] },
      },
    },
  ]),
];

describe("toMinistryLeaderRows", () => {
  test("keeps only the roles of that ministry, by order, with a title per language", () => {
    const rows = toMinistryLeaderRows(people, MINISTRY_ID, LOCALES);
    expect(rows.map((row) => row.order)).toEqual(["1", "2"]);
    expect(rows[0]?.titles).toEqual({ es: "Coordinador", en: "Coordinator" });
    expect(rows[1]?.titles).toEqual({ es: "Directora", en: "" });
    expect(rows[1]?.visible).toBe(true);
  });
});

describe("toMinistryLeadersBody", () => {
  test("sends the languages with a title only, ordered, and round trips the rows", () => {
    const rows = toMinistryLeaderRows(people, MINISTRY_ID, LOCALES);
    expect(toMinistryLeadersBody(rows.slice().reverse())).toEqual([
      {
        personProfileId: "44444444-4444-4444-8444-444444444444",
        visible: false,
        order: 1,
        translations: { es: { title: "Coordinador" }, en: { title: "Coordinator" } },
      },
      {
        personProfileId: "33333333-3333-4333-8333-333333333333",
        visible: true,
        order: 2,
        translations: { es: { title: "Directora" } },
      },
    ]);
  });
});

describe("nextLeaderOrder and blankLeaderRow", () => {
  test("a new row goes after the others and starts hidden", () => {
    const rows = toMinistryLeaderRows(people, MINISTRY_ID, LOCALES);
    expect(nextLeaderOrder(rows)).toBe(3);
    expect(nextLeaderOrder([])).toBe(0);
    expect(blankLeaderRow(LOCALES, 3)).toEqual({
      personProfileId: "",
      visible: false,
      order: "3",
      titles: { es: "", en: "" },
    });
  });
});

describe("validateMinistryLeaders", () => {
  test("a valid list has no errors", () => {
    const rows = toMinistryLeaderRows(people, MINISTRY_ID, LOCALES);
    expect(hasLeaderErrors(validateMinistryLeaders(rows, "es"))).toBe(false);
  });

  test("flags a missing person, a blank default title, a bad order and a repeated person", () => {
    const [first] = toMinistryLeaderRows(people, MINISTRY_ID, LOCALES);
    if (!first) throw new Error("fixture has no leader");
    const rows = [
      { ...blankLeaderRow(LOCALES, 0), order: "x" },
      first,
      { ...first, titles: { es: "", en: "Dup" } },
    ];
    const errors = validateMinistryLeaders(rows, "es");
    expect(errors.rows[0]).toMatchObject({ order: expect.any(String), title: expect.any(String) });
    expect(errors.rows[0]?.personProfileId).toBeDefined();
    expect(errors.rows[1]).toEqual({});
    expect(errors.rows[2]?.personProfileId).toContain("ya está");
    expect(errors.rows[2]?.title).toBeDefined();
  });

  test("more than twelve is a list error", () => {
    const rows = Array.from({ length: 13 }, () => blankLeaderRow(LOCALES, 0));
    expect(validateMinistryLeaders(rows, "es").list).toContain("12");
  });
});
