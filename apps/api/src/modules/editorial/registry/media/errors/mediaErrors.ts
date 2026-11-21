import { DomainError } from "../../../../../core/errors";

/** A snapshot points at media that is missing or does not belong to the organization. */
export class InvalidMediaError extends DomainError {
  readonly status = 400;
  readonly code = "invalid_media";

  constructor(message: string) {
    super(message);
  }
}
