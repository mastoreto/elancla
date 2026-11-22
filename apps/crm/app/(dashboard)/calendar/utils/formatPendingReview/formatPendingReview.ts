import { WEEKDAY_NAMES } from "../dateLabels";
import { pickTitle } from "../pickTitle";

interface PendingReviewInput {
  weekday: number;
  start: string;
  translations: Record<string, { title: string }>;
}

interface PendingReviewLabels {
  title: string;
  when: string;
}

/** Day, hour and title (default language first) of an activity waiting for its annual review. */
export function formatPendingReview(
  review: PendingReviewInput,
  defaultLocale: string,
): PendingReviewLabels {
  const titles = Object.fromEntries(
    Object.entries(review.translations).map(([locale, { title }]) => [locale, title]),
  );
  return {
    title: pickTitle(titles, defaultLocale),
    when: `${WEEKDAY_NAMES[review.weekday] ?? ""} ${review.start}`.trim(),
  };
}
