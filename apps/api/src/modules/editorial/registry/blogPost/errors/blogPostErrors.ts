import { DomainError } from "../../../../../core/errors";

/** Two live posts cannot answer on the same URL. */
export class BlogSlugTakenError extends DomainError {
  readonly status = 409;
  readonly code = "slug_taken";

  constructor(slug: string) {
    super(`The slug "${slug}" is already used by another published post`);
  }
}

/** The slug of a language already published is part of the URL: it cannot change. */
export class BlogSlugLockedError extends DomainError {
  readonly status = 409;
  readonly code = "slug_locked";

  constructor(locale: string) {
    super(
      `The ${locale} slug is already published and cannot change; restore the published one`,
    );
  }
}

type BlogReferenceCode =
  | "invalid_media"
  | "invalid_author"
  | "invalid_category"
  | "invalid_series";

/** A snapshot points at something that is missing or does not belong to the organization. */
export class InvalidBlogReferenceError extends DomainError {
  readonly status = 400;

  constructor(
    readonly code: BlogReferenceCode,
    message: string,
  ) {
    super(message);
  }
}
