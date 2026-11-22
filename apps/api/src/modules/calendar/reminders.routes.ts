import {
  calendarPendingDto,
  calendarReminderSettingsDto,
  PERMISSIONS,
  updateCalendarReminderSettingsBody,
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
import {
  getCalendarPending,
  getCalendarReminderSettings,
  updateCalendarReminderSettings,
} from "./useCases";

const TAGS = ["calendar"];

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

const getRoute = createRoute({
  method: "get",
  path: "/content/calendar/reminders",
  tags: TAGS,
  summary: "Who gets the yearly calendar reminder emails.",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.view)],
  responses: {
    200: jsonResponse("The recipients", calendarReminderSettingsDto),
    ...guardedResponses,
  },
});

const putRoute = createRoute({
  method: "put",
  path: "/content/calendar/reminders",
  tags: TAGS,
  summary: "Replace the recipients (roles and users) of the reminder emails.",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.edit)],
  request: {
    body: {
      content: {
        "application/json": { schema: updateCalendarReminderSettingsBody },
      },
      required: true,
    },
  },
  responses: {
    200: jsonResponse("The recipients", calendarReminderSettingsDto),
    400: problemResponse(
      "The body is not valid, or a role or user does not exist (invalid_role, invalid_user)",
    ),
    ...guardedResponses,
  },
});

const pendingRoute = createRoute({
  method: "get",
  path: "/content/calendar/pending",
  tags: TAGS,
  summary:
    "What is left before the year about to start is ready: publishing it and the annual reviews.",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.view)],
  responses: {
    200: jsonResponse("The pending work", calendarPendingDto),
    ...guardedResponses,
  },
});

export const remindersRoutes = createRouter()
  .openapi(getRoute, async (c) =>
    c.json(
      await getCalendarReminderSettings(
        asAuthenticated(c.get("ctx")).organizationId,
      ),
      200,
    ),
  )
  .openapi(putRoute, async (c) =>
    c.json(
      await updateCalendarReminderSettings(
        asAuthenticated(c.get("ctx")),
        c.req.valid("json"),
      ),
      200,
    ),
  )
  .openapi(pendingRoute, async (c) =>
    c.json(
      await getCalendarPending(asAuthenticated(c.get("ctx")).organizationId),
      200,
    ),
  );
