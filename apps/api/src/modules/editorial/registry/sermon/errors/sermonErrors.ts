import { DomainError } from "../../../../../core/errors";

type SermonReferenceCode = "invalid_preacher" | "invalid_series";

/** A sermon snapshot points at a preacher or a series that is missing or not valid for it. */
export class InvalidSermonReferenceError extends DomainError {
  readonly status = 400;

  constructor(
    readonly code: SermonReferenceCode,
    message: string,
  ) {
    super(message);
  }
}
