import type {
  BlogCoverGlyph,
  BlogCoverTint,
  BlogRichTextDoc,
  CategoryDto,
  PersonProfileDto,
  SeriesDto,
} from "@ancla/contracts";

/** What one language of a post looks like while it is being edited. */
export interface PostTranslationValues {
  title: string;
  slug: string;
  /** Once the user types the slug by hand it stops following the title. */
  slugEdited: boolean;
  excerpt: string;
  body: BlogRichTextDoc;
  /** Comma-separated, as the input holds them; split when saving. */
  tagsText: string;
  seoTitle: string;
  seoDescription: string;
}

/** Both cover kinds are kept so switching tabs does not lose what was typed; `kind` picks one. */
export interface PostCoverValues {
  kind: "photo" | "design";
  mediaId: string;
  alt: string;
  /** Thumbnail of a photo uploaded in this session; a stored cover has none to show. */
  previewUrl: string | null;
  glyph: BlogCoverGlyph;
  tint: BlogCoverTint;
}

export interface PostFormValues {
  /** Editing state by locale. */
  translations: Record<string, PostTranslationValues>;
  authorProfileId: string;
  categoryId: string;
  /** Empty means the post is in no series. */
  seriesId: string;
  /** Position in the series, as the input holds it. */
  seriesOrder: string;
  featured: boolean;
  relatedPostIds: string[];
  cover: PostCoverValues;
  /** `YYYY-MM-DD`. */
  writtenAt: string;
  /** `datetime-local` value (`YYYY-MM-DDTHH:mm`); empty publishes as soon as it is approved. */
  publishAt: string;
}

export type PostTranslationField =
  | "title"
  | "slug"
  | "excerpt"
  | "body"
  | "tags"
  | "seoTitle"
  | "seoDescription";

export type PostGeneralField =
  | "authorProfileId"
  | "categoryId"
  | "seriesOrder"
  | "relatedPostIds"
  | "cover"
  | "writtenAt"
  | "publishAt";

export interface PostFormErrors {
  translations: Record<string, Partial<Record<PostTranslationField, string>>>;
  general: Partial<Record<PostGeneralField, string>>;
}

export interface SiteLocales {
  locales: readonly string[];
  defaultLocale: string;
}

/** The things a post points at, loaded once by the page for its selects. */
export interface PostFormOptions {
  authors: readonly PersonProfileDto[];
  categories: readonly CategoryDto[];
  series: readonly SeriesDto[];
  /** Other posts, for "related": id and title in the default language. */
  relatable: readonly { id: string; title: string }[];
}
