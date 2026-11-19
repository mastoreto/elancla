import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const JSON_MEDIA_TYPE = "application/json";

/** Mutations that carry a body must declare it as JSON; forms and plain text get a 415. */
export const jsonOnly: MiddlewareHandler = async (c, next) => {
  // Behind Next a body-less POST still has an empty `body` stream, so `Content-Length: 0` counts
  // as no body (a browser `fetch` without body sends exactly that).
  const hasBody =
    c.req.raw.body !== null && c.req.header("content-length") !== "0";
  if (!SAFE_METHODS.has(c.req.method) && hasBody) {
    const mediaType = (c.req.header("content-type") ?? "")
      .split(";")[0]
      ?.trim()
      .toLowerCase();
    if (mediaType !== JSON_MEDIA_TYPE) throw new HTTPException(415);
  }
  await next();
};
