import type {
  Permission,
  PermissionScope,
  RoleSummaryDto,
} from "@ancla/contracts";
import type { RequestIdVariables } from "hono/request-id";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

/** Strictest session rules among the roles of a user (D-16). */
export interface SessionPolicy {
  /** False when any role asks for the cookie to die with the browser. */
  persistent: boolean;
  /** Shortest `maxSessionSeconds` among the roles; `null` means the default length. */
  maxSessionSeconds: number | null;
}

/** What a user may do, merged across all of their roles. Built per request by `requireSession`. */
export interface Access {
  /** The admin role grants every permission implicitly, resources added later included. */
  isAdmin: boolean;
  roles: RoleSummaryDto[];
  /** Widest scope per permission; empty for an admin (see `isAdmin`). */
  grants: ReadonlyMap<Permission, PermissionScope>;
  ministryIds: string[];
  sessionPolicy: SessionPolicy;
}

/** What every use case may know about the request. Built per request, never shared. */
export interface RequestContext {
  requestId: string;
  user: SessionUser | null;
  organizationId: string | null;
  access: Access | null;
}

/** An authenticated request: `requireSession` guarantees both fields. */
export interface AuthenticatedContext extends RequestContext {
  user: SessionUser;
  organizationId: string;
  access: Access;
}

export type AppEnv = {
  Variables: RequestIdVariables & { ctx: RequestContext };
};
