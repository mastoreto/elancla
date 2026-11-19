import { DomainError } from "../DomainError";

export interface ValidationIssue {
  path: string;
  message: string;
}

export class ValidationError extends DomainError {
  readonly status = 400;
  readonly code = "validation_error";

  constructor(
    message = "The request is not valid",
    readonly issues: ValidationIssue[] = [],
  ) {
    super(message);
  }
}
