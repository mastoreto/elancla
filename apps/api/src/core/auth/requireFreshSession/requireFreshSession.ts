import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../../context";
import { ForbiddenError, UnauthenticatedError } from "../../errors";
import { getAuth } from "../getAuth";
import {
  MILLISECONDS_PER_SECOND,
  SESSION_FRESH_SECONDS,
} from "../sessionPolicy";

export const SESSION_NOT_FRESH_MESSAGE = "Sign in again to do this";

/** 403 when the session is older than the re-authentication window (`freshAge`). */
export const requireFreshSession: MiddlewareHandler<AppEnv> = async (
  c,
  next,
) => {
  const session = await getAuth().api.getSession({
    headers: c.req.raw.headers,
  });
  if (!session) throw new UnauthenticatedError();
  const age = Date.now() - new Date(session.session.createdAt).getTime();
  if (age >= SESSION_FRESH_SECONDS * MILLISECONDS_PER_SECOND) {
    throw new ForbiddenError(SESSION_NOT_FRESH_MESSAGE);
  }
  await next();
};
