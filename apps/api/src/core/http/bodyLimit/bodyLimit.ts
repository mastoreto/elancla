import type { MiddlewareHandler } from "hono";
import { bodyLimit as honoBodyLimit } from "hono/body-limit";
import { declaresBody } from "../declaresBody";

const MAX_BODY_BYTES = 1024 * 1024;

const limitBody = honoBodyLimit({ maxSize: MAX_BODY_BYTES });

/**
 * Rejects bodies over 1 MB with 413 (hono's default error is mapped to Problem Details). A request
 * without a body skips it: hono rebuilds the request to wrap the stream, which breaks under Next.
 */
export const bodyLimit: MiddlewareHandler = (c, next) =>
  declaresBody(c.req.raw.headers) ? limitBody(c, next) : next();
