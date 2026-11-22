import {
  createEventBody,
  eventDto,
  eventListDto,
  eventListQuery,
  eventSettingsBody,
  PERMISSIONS,
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
  createEvent,
  deleteEvent,
  listEvents,
  updateEventSettings,
} from "./useCases";

const TAGS = ["calendar"];

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

const idParams = z.object({ id: z.uuid() });

const listRoute = createRoute({
  method: "get",
  path: "/content/calendar/events",
  tags: TAGS,
  summary:
    "List the events of a year. Internal events only reach the roles of their audience (and the admin).",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.view)],
  request: { query: eventListQuery },
  responses: {
    200: jsonResponse("The events", eventListDto),
    ...guardedResponses,
  },
});

const createRouteDef = createRoute({
  method: "post",
  path: "/content/calendar/events",
  tags: TAGS,
  summary:
    "Create the row of an event (year, visibility, audience); its content goes in through the editorial draft.",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.create)],
  request: {
    body: {
      content: { "application/json": { schema: createEventBody } },
      required: true,
    },
  },
  responses: {
    201: jsonResponse("Created", eventDto),
    400: problemResponse("The body is not valid or a role does not exist"),
    ...guardedResponses,
  },
});

const patchSettingsRoute = createRoute({
  method: "patch",
  path: "/content/calendar/events/{id}/settings",
  tags: TAGS,
  summary:
    "Replace visibility and audience; `version` is the one read (409 `stale_version` if it moved).",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.edit)],
  request: {
    params: idParams,
    body: {
      content: { "application/json": { schema: eventSettingsBody } },
      required: true,
    },
  },
  responses: {
    200: jsonResponse("After the change", eventDto),
    400: problemResponse("The body is not valid or a role does not exist"),
    404: problemResponse(
      "Not found, or an internal event outside the audience",
    ),
    409: problemResponse("stale_version"),
    ...guardedResponses,
  },
});

const deleteRoute = createRoute({
  method: "delete",
  path: "/content/calendar/events/{id}",
  tags: TAGS,
  summary:
    "Delete an event that was never published; a published one is cancelled instead (`event_live`).",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.delete)],
  request: { params: idParams },
  responses: {
    204: { description: "Deleted" },
    404: problemResponse(
      "Not found, or an internal event outside the audience",
    ),
    409: problemResponse("The event is published (event_live)"),
    ...guardedResponses,
  },
});

export const eventsRoutes = createRouter()
  .openapi(listRoute, async (c) =>
    c.json(
      await listEvents(
        asAuthenticated(c.get("ctx")),
        c.req.valid("query").year,
      ),
      200,
    ),
  )
  .openapi(createRouteDef, async (c) =>
    c.json(
      await createEvent(asAuthenticated(c.get("ctx")), c.req.valid("json")),
      201,
    ),
  )
  .openapi(patchSettingsRoute, async (c) =>
    c.json(
      await updateEventSettings(
        asAuthenticated(c.get("ctx")),
        c.req.valid("param").id,
        c.req.valid("json"),
      ),
      200,
    ),
  )
  .openapi(deleteRoute, async (c) => {
    await deleteEvent(asAuthenticated(c.get("ctx")), c.req.valid("param").id);
    return c.body(null, 204);
  });
