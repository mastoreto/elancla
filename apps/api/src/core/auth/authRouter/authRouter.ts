import { allowPublic } from "../../authz";
import { createRouter } from "../../createApp";
import { NotFoundError } from "../../errors";
import { REQUEST_ID_HEADER, withRequestId } from "../../http";
import { getAuth } from "../getAuth";

/**
 * Better Auth under `/api/auth/*`. Its own rate limiter (database storage) protects every
 * endpoint. Public sign-up is closed: accounts are created only through an invitation
 * (`POST /api/invitations/by-token/:token/accept` calls `auth.api.signUpEmail` on the server).
 */
export function createAuthRouter() {
  const router = createRouter();
  router.on("POST", "/auth/sign-up/email", allowPublic, () => {
    throw new NotFoundError("Route not found");
  });
  // Better Auth's hooks only see the raw request: hand them the id this API generated, and put
  // it on the answer too (a raw Response returned from a handler loses the header set earlier).
  router.on(["GET", "POST"], "/auth/*", allowPublic, async (c) => {
    const requestId = c.get("requestId");
    // Not `new Request(raw, …)`: under Next the raw request is a NextRequest and cloning it throws.
    c.req.raw.headers.set(REQUEST_ID_HEADER, requestId);
    const response = await getAuth().handler(c.req.raw);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: withRequestId(response.headers, requestId),
    });
  });
  return router;
}
