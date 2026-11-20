import { DomainError } from "../../../../core/errors";

/** Optimistic lock failed: someone saved the category or series after the editor loaded it. */
export class StaleVersionError extends DomainError {
  readonly status = 409;
  readonly code = "stale_version";

  constructor() {
    super("It changed since you loaded it; reload and try again");
  }
}

/** A slug of the same language already belongs to another (not deleted) category or series. */
export class TaxonomySlugTakenError extends DomainError {
  readonly status = 409;
  readonly code = "slug_taken";

  constructor(locale: string, slug: string) {
    super(`The ${locale} slug "${slug}" is already in use`);
  }
}

/** Deleting would leave a live post pointing at it. */
export class TaxonomyInUseError extends DomainError {
  readonly status = 409;

  constructor(
    readonly code: "category_in_use" | "series_in_use",
    message: string,
  ) {
    super(message);
  }
}
