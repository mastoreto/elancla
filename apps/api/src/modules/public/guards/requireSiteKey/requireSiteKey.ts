import type { MiddlewareHandler } from "hono";
import { declareAccess } from "../../../../core/authz";
import type { AppEnv } from "../../../../core/context";
import { safeEqualHex, sha256Hex } from "../../../../core/crypto";
import { UnauthenticatedError } from "../../../../core/errors";
import { parseSiteKey } from "../../../siteKeys";
import { findSiteKeyForAuthentication } from "../../data";

const BEARER_PREFIX = "Bearer ";

function bearerTokenOf(header: string | undefined): string {
  if (!header?.startsWith(BEARER_PREFIX)) return "";
  return header.slice(BEARER_PREFIX.length);
}

/**
 * 401 unless the request carries `Authorization: Bearer sk_<keyId>_<secret>` of an active key that
 * belongs to the church named in the path. Every failure throws the same error, so the response
 * never tells a missing key from a revoked one or from another church's.
 * It is the access declaration of the public routes: they have no session on purpose.
 */
// ponytail: no rate limit here. `rateLimit` is keyed by IP and the caller is the web server, so it
// would throttle the whole site; phase 1.10 puts a per-route firewall rule, or a limit per key id.
export const requireSiteKey: MiddlewareHandler<AppEnv> = declareAccess(
  async (c, next) => {
    const parsed = parseSiteKey(bearerTokenOf(c.req.header("authorization")));
    if (!parsed) throw new UnauthenticatedError();
    const key = await findSiteKeyForAuthentication(parsed.id);
    // The digest is compared even when the key is unusable, so every failure costs the same.
    const secretMatches = safeEqualHex(
      sha256Hex(parsed.secret),
      key?.secretHash ?? "",
    );
    const usable =
      key !== null &&
      secretMatches &&
      key.revokedAt === null &&
      key.organization.slug === c.req.param("churchSlug");
    if (!usable) throw new UnauthenticatedError();
    c.get("ctx").organizationId = key.organizationId;
    await next();
  },
);
