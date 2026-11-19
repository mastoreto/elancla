import { DomainError } from "../DomainError";

export class ForbiddenError extends DomainError {
  readonly status = 403;
  readonly code = "forbidden";

  constructor(message = "You are not allowed to do this") {
    super(message);
  }
}
