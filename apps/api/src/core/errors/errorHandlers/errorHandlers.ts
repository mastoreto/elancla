import { AUDIT_ACTIONS } from "@ancla/contracts";
import type { Context, ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { auditSourceFrom, writeAuditBestEffort } from "../../audit";
import type { AppEnv } from "../../context";
import { resolveOrganizationId } from "../../tenancy";
import { DomainError } from "../DomainError";
import { ForbiddenError } from "../ForbiddenError";
import { NotFoundError } from "../NotFoundError";
import { toProblem } from "../toProblem";

const PROBLEM_CONTENT_TYPE = "application/problem+json";

function problemResponse(c: Context<AppEnv>, error: unknown): Response {
  const problem = toProblem(error, c.get("requestId"));
  return c.newResponse(JSON.stringify(problem), problem.status as 400, {
    "Content-Type": PROBLEM_CONTENT_TYPE,
  });
}

function isExpected(error: unknown): boolean {
  return error instanceof DomainError || error instanceof HTTPException;
}

/**
 * Every 403 funnels through here, whichever guard or policy threw it. It runs after the use
 * case's transaction rolled back, so the denial is recorded on its own (best effort).
 */
async function auditDenial(c: Context<AppEnv>, error: ForbiddenError) {
  const ctx = c.get("ctx");
  const organizationId = ctx.organizationId ?? (await resolveOrganizationId());
  await writeAuditBestEffort(auditSourceFrom(ctx, organizationId), {
    action: AUDIT_ACTIONS.permission.denied,
    outcome: "denied",
    metadata: {
      message: error.message,
      method: c.req.method,
      path: c.req.path,
    },
  });
}

export const errorHandler: ErrorHandler<AppEnv> = async (error, c) => {
  if (error instanceof ForbiddenError) {
    // A broken audit must never change the answer: still a 403.
    await auditDenial(c, error).catch(() => undefined);
  }
  if (!isExpected(error)) {
    // Detail stays server-side; the client only gets the requestId to quote.
    console.error(
      JSON.stringify({
        level: "error",
        requestId: c.get("requestId"),
        name: error instanceof Error ? error.name : "UnknownError",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }),
    );
  }
  return problemResponse(c, error);
};

export const notFoundHandler: NotFoundHandler<AppEnv> = (c) =>
  problemResponse(c, new NotFoundError("Route not found"));
