export type DomainErrorStatus = 400 | 401 | 403 | 404 | 409 | 422 | 429;

/** An error the client is allowed to see: its message is written for the caller, not for logs. */
export abstract class DomainError extends Error {
  abstract readonly status: DomainErrorStatus;
  abstract readonly code: string;
}
