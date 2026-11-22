import {
  PLACE_ADDRESS_MAX_LENGTH,
  PLACE_MAPS_URL_MAX_LENGTH,
  PLACE_NAME_MAX_LENGTH,
  type PlaceDto,
  type UpdatePlaceBody,
  type UpsertPlaceBody,
} from "@ancla/contracts";
import {
  nextOrderAfter,
  ORDER_MESSAGE,
  parseOrder,
} from "@/app/(dashboard)/calendar/schedule/utils/orderField";
import {
  toLocaleTexts,
  toTranslations,
  validateTexts,
} from "@/app/(dashboard)/calendar/schedule/utils/translatedText";
import type { PlaceFormErrors, PlaceFormValues } from "../../types";

const ADDRESS_MESSAGE = `Hasta ${PLACE_ADDRESS_MAX_LENGTH} caracteres.`;
const MAPS_URL_MESSAGE = `Un enlace https de hasta ${PLACE_MAPS_URL_MAX_LENGTH} caracteres.`;
const HTTPS_URL_PATTERN = /^https:\/\/\S+$/;

const pickName = (translation: { name: string }): string => translation.name;
const wrapName = (name: string): { name: string } => ({ name });

/** The form state: what the place holds, or the defaults of a new one (after `existingOrders`). */
export function toPlaceFormValues(
  place: PlaceDto | null,
  locales: readonly string[],
  existingOrders: readonly number[] = [],
): PlaceFormValues {
  return {
    names: toLocaleTexts(place?.translations ?? {}, pickName, locales),
    address: place?.address ?? "",
    mapsUrl: place?.mapsUrl ?? "",
    order: String(place?.order ?? nextOrderAfter(existingOrders)),
  };
}

/** A blank optional field travels as `null`. */
function textOrNull(text: string): string | null {
  const trimmed = text.trim();
  return trimmed === "" ? null : trimmed;
}

/** The body to send; `order` is only valid once `validatePlaceForm` passed. */
export function toUpsertPlaceBody(values: PlaceFormValues, defaultLocale: string): UpsertPlaceBody {
  return {
    address: textOrNull(values.address),
    mapsUrl: textOrNull(values.mapsUrl),
    order: parseOrder(values.order) ?? 0,
    translations: toTranslations(values.names, defaultLocale, wrapName),
  };
}

export function toUpdatePlaceBody(
  values: PlaceFormValues,
  defaultLocale: string,
  version: number,
): UpdatePlaceBody {
  return { ...toUpsertPlaceBody(values, defaultLocale), version };
}

/** Field errors for what would be sent; empty when the body is valid. */
export function validatePlaceForm(values: PlaceFormValues, defaultLocale: string): PlaceFormErrors {
  const errors: PlaceFormErrors = {
    names: validateTexts(values.names, defaultLocale, PLACE_NAME_MAX_LENGTH),
  };
  const address = values.address.trim();
  const mapsUrl = values.mapsUrl.trim();
  if (address.length > PLACE_ADDRESS_MAX_LENGTH) errors.address = ADDRESS_MESSAGE;
  if (
    mapsUrl !== "" &&
    !(HTTPS_URL_PATTERN.test(mapsUrl) && mapsUrl.length <= PLACE_MAPS_URL_MAX_LENGTH)
  ) {
    errors.mapsUrl = MAPS_URL_MESSAGE;
  }
  if (parseOrder(values.order) === null) errors.order = ORDER_MESSAGE;
  return errors;
}

export function hasPlaceErrors(errors: PlaceFormErrors): boolean {
  return (
    Object.keys(errors.names).length > 0 ||
    errors.address !== undefined ||
    errors.mapsUrl !== undefined ||
    errors.order !== undefined
  );
}
