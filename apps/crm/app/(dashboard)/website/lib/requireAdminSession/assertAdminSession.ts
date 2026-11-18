const ADMIN_ROLE = "admin";

interface SessionWithRole {
  user: { role?: string | null };
}

export class UnauthorizedActionError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedActionError";
  }
}

/** Pure role check, split from the request-bound guard so it can be tested without a session. */
export function assertAdminSession(session: SessionWithRole | null): void {
  if (session?.user.role !== ADMIN_ROLE) {
    throw new UnauthorizedActionError();
  }
}
