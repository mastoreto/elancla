import { DomainError } from "../../../../core/errors";

/** Two active keys at most per organization: enough to rotate (create the new one, revoke the old). */
export const MAX_ACTIVE_SITE_KEYS = 2;

export class SiteKeyLimitError extends DomainError {
  readonly status = 409;
  readonly code = "site_key_limit";

  constructor() {
    super(
      `At most ${MAX_ACTIVE_SITE_KEYS} site keys can be active; revoke one first`,
    );
  }
}

export function hasReachedSiteKeyLimit(activeKeys: number): boolean {
  return activeKeys >= MAX_ACTIVE_SITE_KEYS;
}
