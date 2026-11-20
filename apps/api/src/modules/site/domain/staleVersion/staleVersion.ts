import { DomainError } from "../../../../core/errors";

/** Optimistic lock failed: someone saved the settings after the editor loaded them. */
export class StaleVersionError extends DomainError {
  readonly status = 409;
  readonly code = "stale_version";

  constructor() {
    super("The settings changed since you loaded them; reload and try again");
  }
}
