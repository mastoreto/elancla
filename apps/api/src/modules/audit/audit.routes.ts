import {
  auditListQuery,
  auditLogDto,
  PERMISSIONS,
  pageSchema,
} from "@ancla/contracts";
import { createRoute } from "@hono/zod-openapi";
import { requireSession } from "../../core/auth";
import { requirePermission } from "../../core/authz";
import type { AuthenticatedContext } from "../../core/context";
import { createRouter } from "../../core/createApp";
import { guardedResponses, jsonResponse } from "../../core/openapi";
import { listAuditLogs } from "./useCases";

const listRoute = createRoute({
  method: "get",
  path: "/audit",
  tags: ["audit"],
  summary:
    "List audit events, newest first. Read-only: the trail cannot be edited.",
  middleware: [requireSession, requirePermission(PERMISSIONS.audit.view)],
  request: { query: auditListQuery },
  responses: {
    200: jsonResponse("A page of audit events", pageSchema(auditLogDto)),
    ...guardedResponses,
  },
});

export const auditRoutes = createRouter().openapi(listRoute, async (c) =>
  c.json(
    await listAuditLogs(
      c.get("ctx") as AuthenticatedContext,
      c.req.valid("query"),
    ),
    200,
  ),
);
