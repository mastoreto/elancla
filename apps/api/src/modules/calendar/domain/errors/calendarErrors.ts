import { DomainError } from "../../../../core/errors";

/** Deleting would leave an activity (or, in 1.6b, an event) pointing at the place. */
export class PlaceInUseError extends DomainError {
  readonly status = 409;
  readonly code = "place_in_use";

  constructor() {
    super("An activity uses this place; move it to another one first");
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
  | "invalid_schedule_set";

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
