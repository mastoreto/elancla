/** Keys of the ministry icons: files `public/images/ministries/<key>.svg` of the web. */
export const MINISTRY_ICONS = [
  "adolescentes",
  "alabanza",
  "espacio-mujer",
  "ensenanza",
  "hombres",
  "jovenes",
  "misiones",
  "multimedia",
  "predicacion",
  "servicio",
] as const;
export type MinistryIcon = (typeof MINISTRY_ICONS)[number];

/** Keys of tokens that already exist in the web `@theme`; no new hex values on purpose. */
export const MINISTRY_COLORS = [
  "obra-red",
  "obra-ink",
  "obra-warm-line",
  "obra-blush",
  "secondary-300",
  "secondary-400",
  "secondary-600",
  "secondary-700",
  "secondary-800",
  "secondary-900",
] as const;
export type MinistryColor = (typeof MINISTRY_COLORS)[number];
export const DEFAULT_MINISTRY_COLOR: MinistryColor = "secondary-700";

/** Tones of a color tile of the landing mosaic. */
export const LANDING_TONES = ["mist", "ink", "red"] as const;
export type LandingTone = (typeof LANDING_TONES)[number];
export const DEFAULT_LANDING_TONE: LandingTone = "mist";

/** Lower case on the wire; the API maps them to the database enums. */
export const MINISTRY_DESTINATIONS = ["page", "external", "none"] as const;
export type MinistryDestination = (typeof MINISTRY_DESTINATIONS)[number];

export const LANDING_TILES = ["color", "photo"] as const;
export type LandingTile = (typeof LANDING_TILES)[number];

export const MINISTRY_NAME_MAX_LENGTH = 80;
export const MINISTRY_SLUG_MAX_LENGTH = 80;
export const MINISTRY_TAGLINE_MAX_LENGTH = 160;
export const MINISTRY_VALUES_MAX_COUNT = 6;
export const MINISTRY_VALUE_TITLE_MAX_LENGTH = 60;
export const MINISTRY_VALUE_DESCRIPTION_MAX_LENGTH = 200;
export const MINISTRY_PLACE_MAX_LENGTH = 120;
export const MINISTRY_AUDIENCE_MAX_LENGTH = 120;
export const MINISTRY_HOW_TO_JOIN_MAX_LENGTH = 300;
export const MINISTRY_NEXT_STEP_MAX_LENGTH = 300;
export const MINISTRY_COVER_ALT_MAX_LENGTH = 200;
export const MINISTRY_SEO_TITLE_MAX_LENGTH = 70;
export const MINISTRY_SEO_DESCRIPTION_MAX_LENGTH = 160;
export const MINISTRY_EXTERNAL_URL_MAX_LENGTH = 2048;
export const MINISTRY_LEADERS_MAX_COUNT = 12;
export const MINISTRY_ORDER_MAX = 9999;
