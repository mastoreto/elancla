/**
 * The platform could not answer (network, quota, rejected key). Not a client mistake: callers map
 * it to an upstream failure, never to a validation error.
 */
export class PlatformRequestError extends Error {
  constructor(
    message: string,
    /** HTTP status of the platform's answer; `null` when there was none (network failure). */
    readonly status: number | null,
  ) {
    super(message);
    this.name = "PlatformRequestError";
  }
}
