import { DomainError } from "../DomainError";

/** The request was well formed, but the content it points to is not acceptable (422). */
export class UnprocessableError extends DomainError {
  readonly status = 422;
  readonly code = "unprocessable";

  constructor(message = "The content cannot be processed") {
    super(message);
  }
}
