import type { PlaceListDto } from "@ancla/contracts";
import { listPlaceRows } from "../../data";
import { toPlaceDto } from "../../mappers";

export async function listPlaces(
  organizationId: string,
): Promise<PlaceListDto> {
  return { items: (await listPlaceRows(organizationId)).map(toPlaceDto) };
}
