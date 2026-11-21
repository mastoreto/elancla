import type { MinistryLandingBody, MinistryListItemDto } from "@ancla/contracts";
import type { LandingRowValues, MoveDirection } from "../../types";

/** The ministries as rows, in the order of the mosaic (ties by name, so the list is stable). */
export function toLandingRows(ministries: readonly MinistryListItemDto[]): LandingRowValues[] {
  return ministries
    .slice()
    .sort(
      (a, b) =>
        a.landingOrder - b.landingOrder || (a.title ?? a.name).localeCompare(b.title ?? b.name),
    )
    .map((ministry) => ({
      id: ministry.id,
      name: ministry.title ?? ministry.name,
      showOnLanding: ministry.showOnLanding,
      landingTile: ministry.landingTile,
      landingTone: ministry.landingTone,
      landingPhotoId: ministry.landingPhotoId ?? "",
    }));
}

/** Swaps the row at `index` with its neighbour; at either end it stays as it is. */
export function moveLandingRow(
  rows: readonly LandingRowValues[],
  index: number,
  direction: MoveDirection,
): LandingRowValues[] {
  const target = direction === "up" ? index - 1 : index + 1;
  const current = rows[index];
  const neighbour = rows[target];
  if (!current || !neighbour) return rows.slice();
  return rows.map((row, at) => {
    if (at === index) return neighbour;
    return at === target ? current : row;
  });
}

/** A photo tile without its photo cannot be saved. */
export function findRowsMissingPhoto(rows: readonly LandingRowValues[]): LandingRowValues[] {
  return rows.filter((row) => row.landingTile === "photo" && row.landingPhotoId === "");
}

/** The whole mosaic: the position in the list becomes `landingOrder`. */
export function toLandingBody(rows: readonly LandingRowValues[]): MinistryLandingBody {
  return rows.map((row, index) => ({
    id: row.id,
    showOnLanding: row.showOnLanding,
    landingOrder: index,
    landingTile: row.landingTile,
    landingTone: row.landingTone,
    landingPhotoId: row.landingTile === "photo" ? row.landingPhotoId : null,
  }));
}
