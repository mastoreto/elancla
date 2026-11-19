import { ministryDto, pageQuerySchema, pageSchema } from "@ancla/contracts";
import { createRoute } from "@hono/zod-openapi";
import { requireSession } from "../../core/auth";
import { requirePermission } from "../../core/authz";
import type { AuthenticatedContext } from "../../core/context";
import { createRouter } from "../../core/createApp";
import { guardedResponses, jsonResponse } from "../../core/openapi";
import { listMinistries } from "./useCases";

const listRoute = createRoute({
  method: "get",
  path: "/ministries",
  tags: ["ministries"],
  summary:
    "List the ministries the user's scope allows. Read-only until phase 1.5.",
  middleware: [requireSession, requirePermission("ministries.profile:view")],
  request: { query: pageQuerySchema },
  responses: {
    200: jsonResponse("A page of ministries", pageSchema(ministryDto)),
    ...guardedResponses,
  },
});

export const ministriesRoutes = createRouter().openapi(listRoute, async (c) =>
  c.json(
    await listMinistries(
      c.get("ctx") as AuthenticatedContext,
      c.req.valid("query"),
    ),
    200,
  ),
);
