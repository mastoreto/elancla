import { db } from "@ancla/db";

/** The audit rows a test provoked, oldest first. The trail cannot be cleaned, so tests find theirs. */
export function auditRowsOf(where: {
  requestId?: string;
  entityId?: string;
  actorLabel?: string;
  action?: string;
}) {
  return db.auditLog.findMany({ where, orderBy: { id: "asc" } });
}

/** The request id the API generated for a response (every response carries it). */
export function requestIdOf(res: Response): string {
  const id = res.headers.get("x-request-id");
  if (!id) throw new Error("The response carries no X-Request-Id");
  return id;
}
