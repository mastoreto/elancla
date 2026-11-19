import {
  createdSiteKeyDto,
  createSiteKeyBody,
  PERMISSIONS,
  type Permission,
  siteKeyDto,
} from "@ancla/contracts";
import { createRoute, z } from "@hono/zod-openapi";
import { auditSourceFrom } from "../../core/audit";
import { requireSession } from "../../core/auth";
import { requirePermission } from "../../core/authz";
import type { AuthenticatedContext } from "../../core/context";
import { createRouter } from "../../core/createApp";
import {
  guardedResponses,
  jsonResponse,
  problemResponse,
} from "../../core/openapi";
import { createSiteKey, listSiteKeys, revokeSiteKey } from "./useCases";

const can = (permission: Permission) => [
  requireSession,
  requirePermission(permission),
];

const idParams = z.object({ id: z.uuid() });
const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

const listRoute = createRoute({
  method: "get",
  path: "/site-keys",
  tags: ["site-keys"],
  summary: "List the keys the public site uses (never their secret).",
  middleware: can(PERMISSIONS.siteKeys.view),
  responses: {
    200: jsonResponse("The keys, newest first", z.array(siteKeyDto)),
    ...guardedResponses,
  },
});

const createKeyRoute = createRoute({
  method: "post",
  path: "/site-keys",
  tags: ["site-keys"],
  summary: "Create a site key. The response is the only time it is shown.",
  middleware: can(PERMISSIONS.siteKeys.create),
  request: {
    body: {
      content: { "application/json": { schema: createSiteKeyBody } },
      required: true,
    },
  },
  responses: {
    201: jsonResponse("Key created, with its plain text", createdSiteKeyDto),
    400: problemResponse("The request is not valid"),
    409: problemResponse("There are already two active keys"),
    ...guardedResponses,
  },
});

const revokeRoute = createRoute({
  method: "delete",
  path: "/site-keys/{id}",
  tags: ["site-keys"],
  summary: "Revoke a site key.",
  middleware: can(PERMISSIONS.siteKeys.delete),
  request: { params: idParams },
  responses: {
    204: { description: "Key revoked" },
    404: problemResponse("Not found or already revoked"),
    ...guardedResponses,
  },
});

export const siteKeysRoutes = createRouter()
  .openapi(listRoute, async (c) =>
    c.json(
      await listSiteKeys(asAuthenticated(c.get("ctx")).organizationId),
      200,
    ),
  )
  .openapi(createKeyRoute, async (c) => {
    const ctx = asAuthenticated(c.get("ctx"));
    const created = await createSiteKey({
      organizationId: ctx.organizationId,
      body: c.req.valid("json"),
      createdById: ctx.user.id,
      audit: auditSourceFrom(ctx, ctx.organizationId),
    });
    return c.json(created, 201);
  })
  .openapi(revokeRoute, async (c) => {
    await revokeSiteKey(asAuthenticated(c.get("ctx")), c.req.valid("param").id);
    return c.body(null, 204);
  });
