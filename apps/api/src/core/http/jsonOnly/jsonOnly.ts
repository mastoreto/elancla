import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { declaresBody } from "../declaresBody";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const JSON_MEDIA_TYPE = "application/json";

/** Mutations that carry a body must declare it as JSON; forms and plain text get a 415. */
export const jsonOnly: MiddlewareHandler = async (c, next) => {
  if (SAFE_METHODS.has(c.req.method) || !declaresBody(c.req.raw.headers))
    return next();
  const mediaType = (c.req.header("content-type") ?? "")
    .split(";")[0]
    ?.trim()
    .toLowerCase();
  if (mediaType !== JSON_MEDIA_TYPE) throw new HTTPException(415);
  await next();
};
