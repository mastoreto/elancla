import { DomainError } from "../../../../../core/errors";

/** Two live items of the same type cannot answer on the same URL. */
export class ContentSlugTakenError extends DomainError {
  readonly status = 409;
  readonly code = "slug_taken";

  constructor(slug: string) {
    super(`The slug "${slug}" is already used by another published item`);
  }
}

/** The slug of a language already published is part of the URL: it cannot change. */
export class ContentSlugLockedError extends DomainError {
  readonly status = 409;
  readonly code = "slug_locked";

  constructor(locale: string) {
    super(
      `The ${locale} slug is already published and cannot change; restore the published one`,
    );
  }
}
