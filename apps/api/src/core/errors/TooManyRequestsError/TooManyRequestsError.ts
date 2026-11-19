import { DomainError } from "../DomainError";

export class TooManyRequestsError extends DomainError {
  readonly status = 429;
  readonly code = "too_many_requests";

  constructor(message = "Too many requests, try again later") {
    super(message);
  }
}
