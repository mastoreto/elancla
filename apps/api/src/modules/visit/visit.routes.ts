import {
  PERMISSIONS,
  type Permission,
  updateVisitBody,
  visitContentDto,
} from "@ancla/contracts";
import { createRoute } from "@hono/zod-openapi";
import { requireSession } from "../../core/auth";
import { requirePermission } from "../../core/authz";
import type { AuthenticatedContext } from "../../core/context";
import { createRouter } from "../../core/createApp";
import {
  guardedResponses,
  jsonResponse,
  problemResponse,
} from "../../core/openapi";
import { getVisit, updateVisit } from "./useCases";

const TAGS = ["site"];

const can = (permission: Permission) => [
  requireSession,
  requirePermission(permission),
];

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

const getRoute = createRoute({
  method: "get",
  path: "/site/visit",
  tags: TAGS,
  summary: "The visit page directions and FAQ as the CRM edits them.",
  middleware: can(PERMISSIONS.visit.view),
  responses: {
    200: jsonResponse("The visit page content", visitContentDto),
    404: problemResponse("The organization has no site settings"),
    ...guardedResponses,
  },
});

const putRoute = createRoute({
  method: "put",
  path: "/site/visit",
  tags: TAGS,
  summary: "Replace the FAQ list and the directions of the languages sent.",
  middleware: can(PERMISSIONS.visit.edit),
  request: {
    body: {
      content: { "application/json": { schema: updateVisitBody } },
      required: true,
    },
  },
  responses: {
    200: jsonResponse(
      "The visit page content after the change",
      visitContentDto,
    ),
    400: problemResponse(
      "The request is not valid, uses a disabled language or an FAQ lacks the default language",
    ),
    404: problemResponse("The organization has no site settings"),
    ...guardedResponses,
  },
});

export const visitRoutes = createRouter()
  .openapi(getRoute, async (c) =>
    c.json(await getVisit(asAuthenticated(c.get("ctx")).organizationId), 200),
  )
  .openapi(putRoute, async (c) =>
    c.json(
      await updateVisit(asAuthenticated(c.get("ctx")), c.req.valid("json")),
      200,
    ),
  );
