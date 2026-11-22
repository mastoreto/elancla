import {
  PERMISSIONS,
  scheduleExceptionDto,
  scheduleExceptionListDto,
  updateScheduleExceptionBody,
  upsertScheduleExceptionBody,
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
  createScheduleException,
  deleteScheduleException,
  listScheduleExceptions,
  updateScheduleException,
} from "./useCases";

const TAGS = ["calendar"];

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

const idParams = z.object({ id: z.uuid() });

const listRoute = createRoute({
  method: "get",
  path: "/content/calendar/exceptions",
  tags: TAGS,
  summary: "List the schedule exceptions by date.",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.view)],
  responses: {
    200: jsonResponse("The exceptions", scheduleExceptionListDto),
    ...guardedResponses,
  },
});

const createRouteDef = createRoute({
  method: "post",
  path: "/content/calendar/exceptions",
  tags: TAGS,
  summary:
    "Create the exception of a date (one per date: `exception_date_taken`).",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.edit)],
  request: {
    body: {
      content: { "application/json": { schema: upsertScheduleExceptionBody } },
      required: true,
    },
  },
  responses: {
    201: jsonResponse("Created", scheduleExceptionDto),
    400: problemResponse(
      "The body is not valid, a language is not enabled or the replacement set is not the church's",
    ),
    409: problemResponse(
      "The date already has an exception (exception_date_taken)",
    ),
    ...guardedResponses,
  },
});

const patchRoute = createRoute({
  method: "patch",
  path: "/content/calendar/exceptions/{id}",
  tags: TAGS,
  summary:
    "Replace the exception; `version` is the one read (409 `stale_version` if it moved).",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.edit)],
  request: {
    params: idParams,
    body: {
      content: { "application/json": { schema: updateScheduleExceptionBody } },
      required: true,
    },
  },
  responses: {
    200: jsonResponse("After the change", scheduleExceptionDto),
    400: problemResponse(
      "The body is not valid, a language is not enabled or the replacement set is not the church's",
    ),
    404: problemResponse("Not found"),
    409: problemResponse("stale_version or exception_date_taken"),
    ...guardedResponses,
  },
});

const deleteRoute = createRoute({
  method: "delete",
  path: "/content/calendar/exceptions/{id}",
  tags: TAGS,
  summary: "Delete the exception for good.",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.edit)],
  request: { params: idParams },
  responses: {
    204: { description: "Deleted" },
    404: problemResponse("Not found"),
    ...guardedResponses,
  },
});

export const exceptionsRoutes = createRouter()
  .openapi(listRoute, async (c) =>
    c.json(
      await listScheduleExceptions(
        asAuthenticated(c.get("ctx")).organizationId,
      ),
      200,
    ),
  )
  .openapi(createRouteDef, async (c) =>
    c.json(
      await createScheduleException(
        asAuthenticated(c.get("ctx")),
        c.req.valid("json"),
      ),
      201,
    ),
  )
  .openapi(patchRoute, async (c) =>
    c.json(
      await updateScheduleException(
        asAuthenticated(c.get("ctx")),
        c.req.valid("param").id,
        c.req.valid("json"),
      ),
      200,
    ),
  )
  .openapi(deleteRoute, async (c) => {
    await deleteScheduleException(
      asAuthenticated(c.get("ctx")),
      c.req.valid("param").id,
    );
    return c.body(null, 204);
  });
