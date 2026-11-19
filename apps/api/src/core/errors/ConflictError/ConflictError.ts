import { DomainError } from "../DomainError";

export class ConflictError extends DomainError {
  readonly status = 409;
  readonly code = "conflict";

  constructor(message = "The request conflicts with the current state") {
    super(message);
  }
}
