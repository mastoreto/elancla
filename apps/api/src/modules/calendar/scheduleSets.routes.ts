import {
  PERMISSIONS,
  scheduleSetDto,
  scheduleSetListDto,
  updateScheduleSetBody,
  upsertScheduleSetBody,
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
  createScheduleSet,
  deleteScheduleSet,
  listScheduleSets,
  updateScheduleSet,
} from "./useCases";

const TAGS = ["calendar"];

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

const idParams = z.object({ id: z.uuid() });

const listRoute = createRoute({
  method: "get",
  path: "/content/calendar/schedule-sets",
  tags: TAGS,
  summary: "List the schedule sets (deleted ones excluded).",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.view)],
  responses: {
    200: jsonResponse("The schedule sets", scheduleSetListDto),
    ...guardedResponses,
  },
});

const createRouteDef = createRoute({
  method: "post",
  path: "/content/calendar/schedule-sets",
  tags: TAGS,
  summary: "Create a schedule set with its translations.",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.edit)],
  request: {
    body: {
      content: { "application/json": { schema: upsertScheduleSetBody } },
      required: true,
    },
  },
  responses: {
    201: jsonResponse("Created", scheduleSetDto),
    400: problemResponse("The body is not valid or a language is not enabled"),
    ...guardedResponses,
  },
});

const patchRoute = createRoute({
  method: "patch",
  path: "/content/calendar/schedule-sets/{id}",
  tags: TAGS,
  summary:
    "Replace the schedule set (turning `isDefault` or `forcedActive` on moves it from the set that had it); `version` is the one read (409 `stale_version` if it moved).",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.edit)],
  request: {
    params: idParams,
    body: {
      content: { "application/json": { schema: updateScheduleSetBody } },
      required: true,
    },
  },
  responses: {
    200: jsonResponse("After the change", scheduleSetDto),
    400: problemResponse("The body is not valid or a language is not enabled"),
    404: problemResponse("Not found"),
    409: problemResponse("stale_version"),
    ...guardedResponses,
  },
});

const deleteRoute = createRoute({
  method: "delete",
  path: "/content/calendar/schedule-sets/{id}",
  tags: TAGS,
  summary:
    "Delete logically, with its activities; refused while an exception uses it as replacement (`schedule_set_in_use`).",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.edit)],
  request: { params: idParams },
  responses: {
    204: { description: "Deleted" },
    404: problemResponse("Not found"),
    409: problemResponse("An exception uses it (schedule_set_in_use)"),
    ...guardedResponses,
  },
});

export const scheduleSetsRoutes = createRouter()
  .openapi(listRoute, async (c) =>
    c.json(
      await listScheduleSets(asAuthenticated(c.get("ctx")).organizationId),
      200,
    ),
  )
  .openapi(createRouteDef, async (c) =>
    c.json(
      await createScheduleSet(
        asAuthenticated(c.get("ctx")),
        c.req.valid("json"),
      ),
      201,
    ),
  )
  .openapi(patchRoute, async (c) =>
    c.json(
      await updateScheduleSet(
        asAuthenticated(c.get("ctx")),
        c.req.valid("param").id,
        c.req.valid("json"),
      ),
      200,
    ),
  )
  .openapi(deleteRoute, async (c) => {
    await deleteScheduleSet(
      asAuthenticated(c.get("ctx")),
      c.req.valid("param").id,
    );
    return c.body(null, 204);
  });
