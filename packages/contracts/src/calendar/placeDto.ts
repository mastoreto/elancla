import { z } from "zod";
import {
  CALENDAR_ORDER_MAX,
  PLACE_ADDRESS_MAX_LENGTH,
  PLACE_MAPS_URL_MAX_LENGTH,
  PLACE_NAME_MAX_LENGTH,
  translationsOf,
  versionField,
} from "./calendarConstants";

const placeTranslationDto = z.strictObject({
  name: z.string().trim().min(1).max(PLACE_NAME_MAX_LENGTH),
});

const address = z
  .string()
  .trim()
  .min(1)
  .max(PLACE_ADDRESS_MAX_LENGTH)
  .nullable();
const mapsUrl = z
  .string()
  .max(PLACE_MAPS_URL_MAX_LENGTH)
  .regex(/^https:\/\/\S+$/, { message: "Must be an https URL" })
  .nullable();

export const placeDto = z.strictObject({
  id: z.uuid(),
  address,
  mapsUrl,
  order: z.number().int(),
  version: z.number().int(),
  translations: z.record(z.string(), placeTranslationDto),
});
export type PlaceDto = z.infer<typeof placeDto>;

export const placeListDto = z.strictObject({ items: z.array(placeDto) });
export type PlaceListDto = z.infer<typeof placeListDto>;

/** Create body. */
export const upsertPlaceBody = z.strictObject({
  address,
  mapsUrl,
  order: z.number().int().min(0).max(CALENDAR_ORDER_MAX),
  translations: translationsOf(placeTranslationDto),
});
export type UpsertPlaceBody = z.infer<typeof upsertPlaceBody>;

/** PATCH body: the same fields plus the `version` read (409 `stale_version`). */
export const updatePlaceBody = upsertPlaceBody.extend({
  version: versionField,
});
export type UpdatePlaceBody = z.infer<typeof updatePlaceBody>;
