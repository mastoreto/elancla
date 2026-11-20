import { DomainError } from "../../../../core/errors";

/** The action does not apply to the state the content is in (or two requests raced). */
export class InvalidTransitionError extends DomainError {
  readonly status = 409;
  readonly code = "invalid_transition";

  constructor(message = "The content is not in a state that allows this") {
    super(message);
  }
}

/** Approving or asking changes on what you wrote yourself would defeat mandatory review. */
export class SelfReviewError extends DomainError {
  readonly status = 403;
  readonly code = "self_review";

  constructor() {
    super("You cannot review your own revision");
  }
}

export class NotReviewerError extends DomainError {
  readonly status = 403;
  readonly code = "not_reviewer";

  constructor() {
    super("Only the reviewers configured for this content can decide on it");
  }
}

export class ReviewRequiredError extends DomainError {
  readonly status = 403;
  readonly code = "review_required";

  constructor() {
    super("This content must be reviewed before it is published");
  }
}
