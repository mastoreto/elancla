import type { RequestIdVariables } from "hono/request-id";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  /** Temporary flat role (admin|viewer); phase 0.4 replaces it with permissions. */
  role: string;
}

/** What every use case may know about the request. Built per request, never shared. */
export interface RequestContext {
  requestId: string;
  user: SessionUser | null;
  organizationId: string | null;
}

/** An authenticated request: `requireSession` guarantees both fields. */
export interface AuthenticatedContext extends RequestContext {
  user: SessionUser;
  organizationId: string;
}

export type AppEnv = {
  Variables: RequestIdVariables & { ctx: RequestContext };
};
