import { DomainError } from "../../../../core/errors";

/** Deleting would leave a ministry pointing at the category. */
export class MinistryCategoryInUseError extends DomainError {
  readonly status = 409;
  readonly code = "category_in_use";

  constructor() {
    super("A ministry uses this category; move it to another one first");
  }
}

type MinistryReferenceCode = "invalid_category" | "invalid_person";

/** A body points at something that is missing or does not belong to the organization. */
export class InvalidMinistryReferenceError extends DomainError {
  readonly status = 400;

  constructor(
    readonly code: MinistryReferenceCode,
    message: string,
  ) {
    super(message);
  }
}
