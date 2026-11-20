import { DomainError } from "../../../../core/errors";

/** Two live pages cannot answer on the same URL. */
export class SlugTakenError extends DomainError {
  readonly status = 409;
  readonly code = "slug_taken";

  constructor(slug: string) {
    super(`The slug "${slug}" is already used by another published page`);
  }
}
