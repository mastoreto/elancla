import { DomainError } from "../../../../../core/errors";

/** The date of the event does not fall in the year the event belongs to. */
export class YearMismatchError extends DomainError {
  readonly status = 409;
  readonly code = "year_mismatch";

  constructor(eventYear: number) {
    super(`The start date must fall in ${eventYear}, the year of the event`);
  }
}

/** Publishing one event of a draft year: the year is published as a whole. */
export class YearNotPublishedError extends DomainError {
  readonly status = 409;
  readonly code = "year_not_published";

  constructor(year: number) {
    super(`The calendar year ${year} is not published yet`);
  }
}

type EventReferenceCode = "invalid_place" | "invalid_ministry";

/** A snapshot points at a place or ministry that is missing or not the organization's. */
export class InvalidEventReferenceError extends DomainError {
  readonly status = 400;

  constructor(
    readonly code: EventReferenceCode,
    message: string,
  ) {
    super(message);
  }
}
