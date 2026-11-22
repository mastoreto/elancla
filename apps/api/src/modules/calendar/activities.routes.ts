import {
  PERMISSIONS,
  recurringActivityDto,
  recurringActivityListDto,
  recurringActivityListQuery,
  updateRecurringActivityBody,
  upsertRecurringActivityBody,
} from "@ancla/contracts";
import { createRoute, z } from "@hono/zod-openapi";
import { requireSession } from "../../core/auth";
import { requirePermission } from "../../core/authz";
import type { AuthenticatedContext } from "../../core/context";
import { createRouter } from "../../core/createApp";
import {
  guardedResponses,
  jsonResponse,
  problemResponse,
} from "../../core/openapi";
import {
  createRecurringActivity,
  deleteRecurringActivity,
  listRecurringActivities,
  updateRecurringActivity,
} from "./useCases";

const TAGS = ["calendar"];

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

const idParams = z.object({ id: z.uuid() });

const listRoute = createRoute({
  method: "get",
  path: "/content/calendar/activities",
  tags: TAGS,
  summary:
    "List the weekly activities (deleted ones excluded), optionally of one schedule set.",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.view)],
  request: { query: recurringActivityListQuery },
  responses: {
    200: jsonResponse("The activities", recurringActivityListDto),
    ...guardedResponses,
  },
});

const createRouteDef = createRoute({
  method: "post",
  path: "/content/calendar/activities",
  tags: TAGS,
  summary: "Create a weekly activity with its translations and ministries.",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.edit)],
  request: {
    body: {
      content: { "application/json": { schema: upsertRecurringActivityBody } },
      required: true,
    },
  },
  responses: {
    201: jsonResponse("Created", recurringActivityDto),
    400: problemResponse(
      "The body is not valid, a language is not enabled or a set, place or ministry is not the church's",
    ),
    ...guardedResponses,
  },
});

const patchRoute = createRoute({
  method: "patch",
  path: "/content/calendar/activities/{id}",
  tags: TAGS,
  summary:
    "Replace the activity; `version` is the one read (409 `stale_version` if it moved).",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.edit)],
  request: {
    params: idParams,
    body: {
      content: { "application/json": { schema: updateRecurringActivityBody } },
      required: true,
    },
  },
  responses: {
    200: jsonResponse("After the change", recurringActivityDto),
    400: problemResponse(
      "The body is not valid, a language is not enabled or a set, place or ministry is not the church's",
    ),
    404: problemResponse("Not found"),
    409: problemResponse("stale_version"),
    ...guardedResponses,
  },
});

const deleteRoute = createRoute({
  method: "delete",
  path: "/content/calendar/activities/{id}",
  tags: TAGS,
  summary: "Delete logically.",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.edit)],
  request: { params: idParams },
  responses: {
    204: { description: "Deleted" },
    404: problemResponse("Not found"),
    ...guardedResponses,
  },
});

export const activitiesRoutes = createRouter()
  .openapi(listRoute, async (c) =>
    c.json(
      await listRecurringActivities(
        asAuthenticated(c.get("ctx")).organizationId,
        c.req.valid("query").scheduleSetId,
      ),
      200,
    ),
  )
  .openapi(createRouteDef, async (c) =>
    c.json(
      await createRecurringActivity(
        asAuthenticated(c.get("ctx")),
        c.req.valid("json"),
      ),
      201,
    ),
  )
  .openapi(patchRoute, async (c) =>
    c.json(
      await updateRecurringActivity(
        asAuthenticated(c.get("ctx")),
        c.req.valid("param").id,
        c.req.valid("json"),
      ),
      200,
    ),
  )
  .openapi(deleteRoute, async (c) => {
    await deleteRecurringActivity(
      asAuthenticated(c.get("ctx")),
      c.req.valid("param").id,
    );
    return c.body(null, 204);
  });
