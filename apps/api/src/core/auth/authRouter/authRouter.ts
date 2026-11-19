import { createRouter } from "../../createApp";
import { NotFoundError } from "../../errors";
import { getAuth } from "../getAuth";

/**
 * Better Auth under `/api/auth/*`. Its own rate limiter (database storage) protects every
 * endpoint. Public sign-up is closed: accounts are created only through an invitation
 * (`POST /api/invitations/by-token/:token/accept` calls `auth.api.signUpEmail` on the server).
 */
export function createAuthRouter() {
  const router = createRouter();
  router.on("POST", "/auth/sign-up/email", () => {
    throw new NotFoundError("Route not found");
  });
  router.on(["GET", "POST"], "/auth/*", (c) => getAuth().handler(c.req.raw));
  return router;
}
