import {
  type MinistryTranslation,
  ministrySnapshot as ministrySnapshotSchema,
  type RichTextDoc,
} from "@ancla/contracts";
import type { MinistryFormValues, MinistryTranslationValues } from "../../types";

export const EMPTY_ABOUT: RichTextDoc = { type: "doc", content: [{ type: "paragraph" }] };

/** A body with no block, or only empty paragraphs, counts as not written. */
export function isAboutEmpty(about: RichTextDoc): boolean {
  return about.content.every((block) => block.type === "paragraph" && !block.content?.length);
}

function emptyTranslation(): MinistryTranslationValues {
  return {
    name: "",
    slug: "",
    slugEdited: false,
    tagline: "",
    about: EMPTY_ABOUT,
    values: [],
    place: "",
    audience: "",
    howToJoin: "",
    nextStep: "",
    coverAlt: "",
    seoTitle: "",
    seoDescription: "",
  };
}

function fromStored(stored: MinistryTranslation): MinistryTranslationValues {
  return {
    name: stored.name,
    slug: stored.slug,
    slugEdited: true,
    tagline: stored.tagline,
    about: stored.about.content.length > 0 ? stored.about : EMPTY_ABOUT,
    values: stored.values,
    place: stored.place ?? "",
    audience: stored.audience ?? "",
    howToJoin: stored.howToJoin ?? "",
    nextStep: stored.nextStep ?? "",
    coverAlt: stored.coverAlt ?? "",
    seoTitle: stored.seoTitle ?? "",
    seoDescription: stored.seoDescription ?? "",
  };
}

/** The form state for every language: what the snapshot holds, blank for the rest. */
export function toMinistryFormValues(
  snapshot: Record<string, unknown> | null,
  locales: readonly string[],
): MinistryFormValues {
  const parsed = snapshot ? ministrySnapshotSchema.safeParse(snapshot) : null;
  const stored = parsed?.success ? parsed.data : null;
  return {
    translations: Object.fromEntries(
      locales.map((locale) => {
        const translation = stored?.translations[locale];
        return [locale, translation ? fromStored(translation) : emptyTranslation()];
      }),
    ),
    coverMediaId: stored?.coverMediaId ?? "",
    socialImageId: stored?.socialImageId ?? "",
  };
}

function isTranslationBlank(values: MinistryTranslationValues): boolean {
  return (
    values.name.trim() === "" &&
    values.slug.trim() === "" &&
    values.tagline.trim() === "" &&
    values.values.length === 0 &&
    values.place.trim() === "" &&
    values.audience.trim() === "" &&
    values.howToJoin.trim() === "" &&
    values.nextStep.trim() === "" &&
    values.coverAlt.trim() === "" &&
    values.seoTitle.trim() === "" &&
    values.seoDescription.trim() === "" &&
    isAboutEmpty(values.about)
  );
}

/** The optional texts the user left blank are not sent, so the strict schema never sees them. */
function optionalTextsOf(values: MinistryTranslationValues): Record<string, string> {
  const optional = {
    place: values.place.trim(),
    audience: values.audience.trim(),
    howToJoin: values.howToJoin.trim(),
    nextStep: values.nextStep.trim(),
    coverAlt: values.coverAlt.trim(),
    seoTitle: values.seoTitle.trim(),
    seoDescription: values.seoDescription.trim(),
  };
  return Object.fromEntries(Object.entries(optional).filter(([, text]) => text !== ""));
}

function toTranslationInput(values: MinistryTranslationValues): Record<string, unknown> {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    tagline: values.tagline.trim(),
    about: values.about,
    values: values.values.map((value) => ({
      title: value.title.trim(),
      description: value.description.trim(),
    })),
    ...optionalTextsOf(values),
  };
}

/**
 * The snapshot to send, with exactly the keys the API's strict schema knows. The default language
 * always goes (the API requires it); a blank translation of any other language is left out so it
 * does not fail validation.
 */
export function toMinistrySnapshot(
  values: MinistryFormValues,
  defaultLocale: string,
): Record<string, unknown> {
  const translations = Object.entries(values.translations)
    .filter(([locale, translation]) => locale === defaultLocale || !isTranslationBlank(translation))
    .map(([locale, translation]) => [locale, toTranslationInput(translation)] as const);
  return {
    translations: Object.fromEntries(translations),
    ...(values.coverMediaId ? { coverMediaId: values.coverMediaId } : {}),
    ...(values.socialImageId ? { socialImageId: values.socialImageId } : {}),
  };
}
