import { DomainError } from "../../../../../core/errors";

type BlogReferenceCode =
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
