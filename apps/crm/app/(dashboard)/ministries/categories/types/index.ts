import type { MinistryCategoryDto } from "@ancla/contracts";
import type { SiteLocales } from "../../types";

export type { SiteLocales };

export interface CategoryFormValues {
  /** Kept as typed; validated as an integer when saving. */
  order: string;
  /** Name by locale, as the inputs hold them. */
  names: Record<string, string>;
}

/** Error message per locale (for the name) and for the order. */
export interface CategoryFormErrors {
  order?: string;
  names: Record<string, string>;
}

export interface CategoriesData {
  categories: readonly MinistryCategoryDto[];
  site: SiteLocales;
}
