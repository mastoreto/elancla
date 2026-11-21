import type {
  MinistryCategoryDto,
  MinistryColor,
  MinistryDestination,
  MinistryIcon,
  MinistryListItemDto,
  MinistryValue,
  PersonProfileDto,
  RichTextDoc,
} from "@ancla/contracts";

export type { SiteLocales } from "../../types";

/** What one language of a ministry profile looks like while it is being edited. */
export interface MinistryTranslationValues {
  name: string;
  slug: string;
  /** Once the user types the slug by hand it stops following the name. */
  slugEdited: boolean;
  tagline: string;
  about: RichTextDoc;
  values: MinistryValue[];
  place: string;
  audience: string;
  howToJoin: string;
  nextStep: string;
  coverAlt: string;
  seoTitle: string;
  seoDescription: string;
}

export interface MinistryFormValues {
  /** Editing state by locale. */
  translations: Record<string, MinistryTranslationValues>;
  /** Id of the cover picture; empty when there is none. */
  coverMediaId: string;
  /** Empty means the cover is used for social cards. */
  socialImageId: string;
}

export type MinistryTranslationField =
  | "name"
  | "slug"
  | "tagline"
  | "about"
  | "values"
  | "place"
  | "audience"
  | "howToJoin"
  | "nextStep"
  | "coverAlt"
  | "seoTitle"
  | "seoDescription";

export type MinistryGeneralField = "coverMediaId" | "socialImageId";

export interface MinistryFormErrors {
  translations: Record<string, Partial<Record<MinistryTranslationField, string>>>;
  general: Partial<Record<MinistryGeneralField, string>>;
}

/** The settings of a ministry while they are being edited; empty strings mean "none". */
export interface MinistrySettingsValues {
  categoryId: string;
  destination: MinistryDestination;
  externalUrl: string;
  icon: MinistryIcon | "";
  color: MinistryColor;
}

export interface MinistrySettingsErrors {
  externalUrl?: string;
}

/** One leader row while it is being edited. */
export interface MinistryLeaderValues {
  personProfileId: string;
  visible: boolean;
  /** Kept as typed; validated as an integer when saving. */
  order: string;
  /** Title by locale, as the inputs hold them. */
  titles: Record<string, string>;
}

export interface MinistryLeaderErrors {
  personProfileId?: string;
  order?: string;
  title?: string;
}

/** What the Configuración and Responsables cards read; only loaded for roles with the all scope. */
export interface MinistryConfiguration {
  ministry: MinistryListItemDto;
  categories: readonly MinistryCategoryDto[];
  /** Every person of the organization: the leader candidates, and where the leaders are read from. */
  people: readonly PersonProfileDto[];
}
