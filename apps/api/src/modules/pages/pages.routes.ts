import {
  createSimplePageResponse,
  PERMISSIONS,
  simplePageListDto,
} from "@ancla/contracts";
import { createRoute } from "@hono/zod-openapi";
import { requireSession } from "../../core/auth";
import { requirePermission } from "../../core/authz";
import type { AuthenticatedContext } from "../../core/context";
import { createRouter } from "../../core/createApp";
import { guardedResponses, jsonResponse } from "../../core/openapi";
import { createPage, listPages } from "./useCases";

const TAGS = ["pages"];

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

const listRoute = createRoute({
  method: "get",
  path: "/content/pages",
  tags: TAGS,
  summary: "List the simple pages with their live and working revisions.",
  middleware: [requireSession, requirePermission(PERMISSIONS.pages.view)],
  responses: {
    200: jsonResponse("The pages, newest first", simplePageListDto),
    ...guardedResponses,
  },
});

const createRouteDef = createRoute({
  method: "post",
  path: "/content/pages",
  tags: TAGS,
  summary:
    "Create an empty page; its content goes through /editorial/simple-page/{id}/draft.",
  middleware: [requireSession, requirePermission(PERMISSIONS.pages.create)],
  responses: {
    201: jsonResponse("The page created", createSimplePageResponse),
    ...guardedResponses,
  },
});

export const pagesRoutes = createRouter()
  .openapi(listRoute, async (c) =>
    c.json(await listPages(asAuthenticated(c.get("ctx")).organizationId), 200),
  )
  .openapi(createRouteDef, async (c) =>
    c.json(await createPage(asAuthenticated(c.get("ctx"))), 201),
  );
