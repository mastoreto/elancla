import type { VisitContentDto } from "@ancla/contracts";

export type DirectionKey = "parking" | "transit" | "accessibility";

export type SiteLocales = Pick<VisitContentDto, "locales" | "defaultLocale">;

/** One FAQ while it is being edited (strings, as the textareas hold them). */
export interface FaqFormValues {
  /** Stable key for React and for reordering; not sent to the API. */
  key: string;
  /** Question by locale; empty strings are dropped when saving. */
  questions: Record<string, string>;
  /** Answer by locale; empty strings are dropped when saving. */
  answers: Record<string, string>;
}

export interface VisitFormValues {
  /** Direction text by key, then by locale; empty strings are saved as `null`. */
  directions: Record<DirectionKey, Record<string, string>>;
  faqs: FaqFormValues[];
}

export interface FaqFormErrors {
  question?: string;
  answer?: string;
}

export interface VisitFormErrors {
  directions: Partial<Record<DirectionKey, string>>;
  /** By FAQ key. */
  faqs: Record<string, FaqFormErrors>;
}
