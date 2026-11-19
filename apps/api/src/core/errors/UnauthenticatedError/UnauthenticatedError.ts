import { DomainError } from "../DomainError";

export class UnauthenticatedError extends DomainError {
  readonly status = 401;
  readonly code = "unauthenticated";

  constructor(message = "Authentication is required") {
    super(message);
  }
}
