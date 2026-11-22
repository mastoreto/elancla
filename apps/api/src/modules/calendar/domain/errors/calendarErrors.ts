import { DomainError } from "../../../../core/errors";

/** Deleting would leave an activity or an event pointing at the place. */
export class PlaceInUseError extends DomainError {
  readonly status = 409;
  readonly code = "place_in_use";

  constructor() {
    super(
      "An activity or an event uses this place; move it to another one first",
    );
  }
}

/** Deleting would leave an exception pointing at the schedule set. */
export class ScheduleSetInUseError extends DomainError {
  readonly status = 409;
  readonly code = "schedule_set_in_use";

  constructor() {
    super("An exception uses this schedule set as its replacement");
  }
}

/** There is one exception per date. */
export class ExceptionDateTakenError extends DomainError {
  readonly status = 409;
  readonly code = "exception_date_taken";

  constructor() {
    super("There is already an exception on that date");
  }
}

type CalendarReferenceCode =
  | "invalid_place"
  | "invalid_ministry"
  | "invalid_schedule_set"
  | "invalid_role";

/** A body points at something that is missing or does not belong to the organization. */
export class InvalidCalendarReferenceError extends DomainError {
  readonly status = 400;

  constructor(
    readonly code: CalendarReferenceCode,
    message: string,
  ) {
    super(message);
  }
}

/** The event has a live revision: the public site already shows it, so it is cancelled, not deleted. */
export class EventLiveError extends DomainError {
  readonly status = 409;
  readonly code = "event_live";

  constructor() {
    super("The event is published; cancel it instead of deleting it");
  }
}

export class YearExistsError extends DomainError {
  readonly status = 409;
  readonly code = "year_exists";

  constructor() {
    super("That calendar year already exists");
  }
}

export class YearAlreadyPublishedError extends DomainError {
  readonly status = 409;
  readonly code = "year_already_published";

  constructor() {
    super("That calendar year is already published");
  }
}

/** Copying fills a draft year: a published one changes event by event. */
export class CopyTargetNotDraftError extends DomainError {
  readonly status = 409;
  readonly code = "year_not_draft";

  constructor() {
    super("Only a draft calendar year can receive a copy");
  }
}

export class InvalidCopySelectionError extends DomainError {
  readonly status = 400;
  readonly code = "invalid_copy_selection";

  constructor(readonly rejectedIds: readonly string[]) {
    super("Some selected items cannot be copied from that year");
  }
}

/** Only a fixed activity with annual review is confirmed year by year. */
export class NotReviewableError extends DomainError {
  readonly status = 400;
  readonly code = "not_reviewable";

  constructor() {
    super("That activity is not a fixed activity with annual review");
  }
}
