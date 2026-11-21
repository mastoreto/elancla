import type { CategoryDto, SeriesDto } from "@ancla/contracts";

export interface SiteLocales {
  locales: readonly string[];
  defaultLocale: string;
}

/** One language of a category while it is being edited. */
export interface CategoryTranslationValues {
  name: string;
  slug: string;
  /** Once the user types the slug by hand it stops following the name. */
  slugEdited: boolean;
}

export interface CategoryFormValues {
  /** Kept as typed; validated as an integer when saving. */
  order: string;
  translations: Record<string, CategoryTranslationValues>;
}

/** One language of a series while it is being edited. */
export interface SeriesTranslationValues {
  name: string;
  slug: string;
  slugEdited: boolean;
  description: string;
}

export interface SeriesFormValues {
  translations: Record<string, SeriesTranslationValues>;
}

export type TaxonomyField = "name" | "slug" | "description";

/** Error message per field, by locale; `order` is the category order. */
export interface TaxonomyFormErrors {
  order?: string;
  translations: Record<string, Partial<Record<TaxonomyField, string>>>;
}

export interface TaxonomyData {
  categories: readonly CategoryDto[];
  series: readonly SeriesDto[];
  site: SiteLocales;
}
