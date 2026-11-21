import { describe, expect, test } from "bun:test";
import type { MinistryListItemDto } from "@ancla/contracts";
import type { LandingRowValues } from "../../types";
import { findRowsMissingPhoto, moveLandingRow, toLandingBody, toLandingRows } from "./landingRows";

const PHOTO_ID = "99999999-9999-4999-8999-999999999999";

function ministry(id: string, overrides: Partial<MinistryListItemDto>): MinistryListItemDto {
  return {
    id,
    name: id,
    title: null,
    version: 1,
    categoryId: null,
    destination: "page",
    externalUrl: null,
    icon: null,
    color: "secondary-700",
    showOnLanding: false,
    landingOrder: 0,
    landingTile: "color",
    landingTone: "mist",
    landingPhotoId: null,
    live: null,
    working: null,
    ...overrides,
  };
}

const row = (id: string, overrides: Partial<LandingRowValues> = {}): LandingRowValues => ({
  id,
  name: id,
  showOnLanding: true,
  landingTile: "color",
  landingTone: "mist",
  landingPhotoId: "",
  ...overrides,
});

describe("toLandingRows", () => {
  test("orders by landing order, then by name, and shows the public title when there is one", () => {
    const rows = toLandingRows([
      ministry("b", { landingOrder: 1 }),
      ministry("c", { landingOrder: 0, title: "Zeta" }),
      ministry("a", { landingOrder: 1 }),
    ]);
    expect(rows.map((item) => item.name)).toEqual(["Zeta", "a", "b"]);
  });
});

describe("moveLandingRow", () => {
  const rows = [row("a"), row("b"), row("c")];

  test("moves a row up or down by swapping it with its neighbour", () => {
    expect(moveLandingRow(rows, 1, "up").map((item) => item.id)).toEqual(["b", "a", "c"]);
    expect(moveLandingRow(rows, 1, "down").map((item) => item.id)).toEqual(["a", "c", "b"]);
  });

  test("the first cannot go up and the last cannot go down", () => {
    expect(moveLandingRow(rows, 0, "up").map((item) => item.id)).toEqual(["a", "b", "c"]);
    expect(moveLandingRow(rows, 2, "down").map((item) => item.id)).toEqual(["a", "b", "c"]);
  });

  test("does not mutate the rows it was given", () => {
    moveLandingRow(rows, 0, "down");
    expect(rows.map((item) => item.id)).toEqual(["a", "b", "c"]);
  });
});

describe("toLandingBody", () => {
  test("the position is the order, and only a photo tile carries its photo", () => {
    const body = toLandingBody([
      row("a", { landingTile: "photo", landingPhotoId: PHOTO_ID }),
      row("b", { landingPhotoId: PHOTO_ID, showOnLanding: false, landingTone: "red" }),
    ]);
    expect(body).toEqual([
      {
        id: "a",
        showOnLanding: true,
        landingOrder: 0,
        landingTile: "photo",
        landingTone: "mist",
        landingPhotoId: PHOTO_ID,
      },
      {
        id: "b",
        showOnLanding: false,
        landingOrder: 1,
        landingTile: "color",
        landingTone: "red",
        landingPhotoId: null,
      },
    ]);
  });
});

describe("findRowsMissingPhoto", () => {
  test("lists the photo tiles that have no photo", () => {
    const rows = [
      row("a", { landingTile: "photo" }),
      row("b", { landingTile: "photo", landingPhotoId: PHOTO_ID }),
      row("c"),
    ];
    expect(findRowsMissingPhoto(rows).map((item) => item.id)).toEqual(["a"]);
  });
});
