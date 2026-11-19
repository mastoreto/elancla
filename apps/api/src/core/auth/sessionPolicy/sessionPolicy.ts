export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const SESSION_REFRESH_SECONDS = 60 * 60 * 24;
/** Re-authentication window for sensitive operations. The role-based policy lives in `core/authz` (`mergeSessionPolicy`). */
export const SESSION_FRESH_SECONDS = 60 * 10;
export const MILLISECONDS_PER_SECOND = 1000;
