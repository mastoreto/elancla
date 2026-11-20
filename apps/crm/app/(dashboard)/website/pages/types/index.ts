import type { RichTextDoc } from "@ancla/contracts";

/** What one language of a page looks like while it is being edited. */
export interface PageTranslationValues {
  title: string;
  slug: string;
  /** Once the user types the slug by hand it stops following the title. */
  slugEdited: boolean;
  body: RichTextDoc;
  seoTitle: string;
  seoDescription: string;
}

/** Editing state by locale. */
export type PageFormValues = Record<string, PageTranslationValues>;

export type PageTranslationField = "title" | "slug" | "body" | "seoTitle" | "seoDescription";

/** Error message per field, by locale. */
export type PageFormErrors = Record<string, Partial<Record<PageTranslationField, string>>>;

export interface SiteLocales {
  locales: readonly string[];
  defaultLocale: string;
}
