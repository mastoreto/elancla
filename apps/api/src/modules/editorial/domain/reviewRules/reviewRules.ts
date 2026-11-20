/** Who reviews and who must be reviewed, for one content type. */
export interface ReviewSettings {
  reviewerRoleIds: readonly string[];
  reviewerUserIds: readonly string[];
  mandatoryReviewRoleIds: readonly string[];
  mandatoryReviewUserIds: readonly string[];
}

export interface Reviewable {
  userId: string;
  roleIds: readonly string[];
  isAdmin?: boolean;
}

export const NO_REVIEW_SETTINGS: ReviewSettings = {
  reviewerRoleIds: [],
  reviewerUserIds: [],
  mandatoryReviewRoleIds: [],
  mandatoryReviewUserIds: [],
};

const sharesAny = (
  left: readonly string[],
  right: readonly string[],
): boolean => left.some((id) => right.includes(id));

/** The admin always reviews; anyone else only if listed, by name or through a role. */
export function isReviewer(
  settings: ReviewSettings,
  person: Reviewable,
): boolean {
  if (person.isAdmin) return true;
  return (
    settings.reviewerUserIds.includes(person.userId) ||
    sharesAny(settings.reviewerRoleIds, person.roleIds)
  );
}

/** Whether what this person writes cannot be published without someone else's approval. */
export function mustBeReviewed(
  settings: ReviewSettings,
  person: Reviewable,
): boolean {
  return (
    settings.mandatoryReviewUserIds.includes(person.userId) ||
    sharesAny(settings.mandatoryReviewRoleIds, person.roleIds)
  );
}
