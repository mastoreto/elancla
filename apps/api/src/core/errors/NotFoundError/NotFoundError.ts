import { DomainError } from "../DomainError";

export class NotFoundError extends DomainError {
  readonly status = 404;
  readonly code = "not_found";

  constructor(message = "The resource was not found") {
    super(message);
  }
}
