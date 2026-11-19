import type { MiddlewareHandler } from "hono";
import { csrf as honoCsrf } from "hono/csrf";
import { HTTPException } from "hono/http-exception";
import { getApiEnv } from "../../env";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const ALLOWED_FETCH_SITES = new Set(["same-origin", "none"]);

// hono/csrf only inspects form-like content types and accepts a request when EITHER check passes.
// security.md asks for an allowlisted Origin and same-origin Fetch Metadata on every mutation, so
// the check below covers JSON bodies too.
const formCsrf = honoCsrf({
  origin: (origin) => origin === getApiEnv().CRM_ORIGIN,
  secFetchSite: "same-origin",
});

/**
 * Rejects mutations that a browser did not issue from the CRM origin.
 * Requests with neither `Origin` nor `Sec-Fetch-Site` come from non-browser clients, which carry
 * no ambient cookies to abuse.
 */
export const csrf: MiddlewareHandler = async (c, next) => {
  if (!SAFE_METHODS.has(c.req.method)) {
    const origin = c.req.header("origin");
    const fetchSite = c.req.header("sec-fetch-site");
    const foreignOrigin =
      origin !== undefined && origin !== getApiEnv().CRM_ORIGIN;
    const foreignSite =
      fetchSite !== undefined && !ALLOWED_FETCH_SITES.has(fetchSite);
    if (foreignOrigin || foreignSite) throw new HTTPException(403);
  }
  return formCsrf(c, next);
};
