import type { PlaceDto } from "@ancla/contracts";
import type {
  LocaleErrors,
  LocaleTexts,
  SiteLocales,
} from "@/app/(dashboard)/calendar/schedule/types";

export type { SiteLocales };

export interface PlaceFormValues {
  names: LocaleTexts;
  /** Blank means no address. */
  address: string;
  /** Blank means no map link; otherwise an https URL. */
  mapsUrl: string;
  /** Kept as typed; validated as an integer when saving. */
  order: string;
}

export interface PlaceFormErrors {
  names: LocaleErrors;
  address?: string;
  mapsUrl?: string;
  order?: string;
}

export interface PlacesData {
  places: readonly PlaceDto[];
  site: SiteLocales;
  /** Whether the viewer holds `events.edit`; reading only needs `events.view`. */
  canEdit: boolean;
}
