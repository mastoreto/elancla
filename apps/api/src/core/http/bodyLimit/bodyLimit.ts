import { bodyLimit as honoBodyLimit } from "hono/body-limit";

const MAX_BODY_BYTES = 1024 * 1024;

/** Rejects bodies over 1 MB with 413 (hono's default error is mapped to Problem Details). */
export const bodyLimit = honoBodyLimit({ maxSize: MAX_BODY_BYTES });
