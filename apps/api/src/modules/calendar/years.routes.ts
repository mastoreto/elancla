import {
  activityReviewDto,
  calendarYearDto,
  calendarYearListDto,
  calendarYearParams,
  confirmReviewBody,
  copyYearBody,
  copyYearResultDto,
  createCalendarYearBody,
  PERMISSIONS,
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
  confirmActivityReview,
  copyCalendarYear,
  createCalendarYear,
  listCalendarYears,
  publishCalendarYear,
} from "./useCases";

const TAGS = ["calendar"];

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

const listRoute = createRoute({
  method: "get",
  path: "/content/calendar/years",
  tags: TAGS,
  summary: "The calendar years and whether each is a draft or published.",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.view)],
  responses: {
    200: jsonResponse("The years", calendarYearListDto),
    ...guardedResponses,
  },
});

const createRouteDef = createRoute({
  method: "post",
  path: "/content/calendar/years",
  tags: TAGS,
  summary: "Create a calendar year as a draft.",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.edit)],
  request: {
    body: {
      content: { "application/json": { schema: createCalendarYearBody } },
      required: true,
    },
  },
  responses: {
    201: jsonResponse("Created", calendarYearDto),
    400: problemResponse("The body is not valid"),
    409: problemResponse("The year already exists (year_exists)"),
    ...guardedResponses,
  },
});

const publishRoute = createRoute({
  method: "post",
  path: "/content/calendar/years/{year}/publish",
  tags: TAGS,
  summary:
    "Publish the year and take every event draft of it live, in one transaction.",
  middleware: [
    requireSession,
    requirePermission(PERMISSIONS.calendarYear.publish),
  ],
  request: { params: calendarYearParams },
  responses: {
    200: jsonResponse("The published year", calendarYearDto),
    400: problemResponse("An event refers to a place or ministry that is gone"),
    404: problemResponse("The year does not exist"),
    409: problemResponse(
      "Already published, or an event cannot go live (year_mismatch, invalid media...)",
    ),
    ...guardedResponses,
  },
});

const copyRoute = createRoute({
  method: "post",
  path: "/content/calendar/years/{year}/copy",
  tags: TAGS,
  summary:
    "Copy exactly the selected activities and events of an earlier year into this draft year.",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.edit)],
  request: {
    params: calendarYearParams,
    body: {
      content: { "application/json": { schema: copyYearBody } },
      required: true,
    },
  },
  responses: {
    200: jsonResponse("What was copied", copyYearResultDto),
    400: problemResponse(
      "The body is not valid, or an id is not copiable from that year (invalid_copy_selection)",
    ),
    404: problemResponse("The target year does not exist"),
    409: problemResponse("The target year is not a draft (year_not_draft)"),
    ...guardedResponses,
  },
});

const reviewRoute = createRoute({
  method: "post",
  path: "/content/calendar/years/{year}/reviews",
  tags: TAGS,
  summary:
    "Confirm that a fixed activity with annual review is still right for this year.",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.edit)],
  request: {
    params: calendarYearParams,
    body: {
      content: { "application/json": { schema: confirmReviewBody } },
      required: true,
    },
  },
  responses: {
    200: jsonResponse("The confirmation", activityReviewDto),
    400: problemResponse(
      "The activity is not a fixed one with annual review (not_reviewable)",
    ),
    404: problemResponse("The activity does not exist"),
    ...guardedResponses,
  },
});

export const yearsRoutes = createRouter()
  .openapi(listRoute, async (c) =>
    c.json(
      await listCalendarYears(asAuthenticated(c.get("ctx")).organizationId),
      200,
    ),
  )
  .openapi(createRouteDef, async (c) =>
    c.json(
      await createCalendarYear(
        asAuthenticated(c.get("ctx")),
        c.req.valid("json"),
      ),
      201,
    ),
  )
  .openapi(publishRoute, async (c) =>
    c.json(
      await publishCalendarYear(
        asAuthenticated(c.get("ctx")),
        c.req.valid("param").year,
      ),
      200,
    ),
  )
  .openapi(copyRoute, async (c) =>
    c.json(
      await copyCalendarYear(
        asAuthenticated(c.get("ctx")),
        c.req.valid("param").year,
        c.req.valid("json"),
      ),
      200,
    ),
  )
  .openapi(reviewRoute, async (c) =>
    c.json(
      await confirmActivityReview(
        asAuthenticated(c.get("ctx")),
        c.req.valid("param").year,
        c.req.valid("json"),
      ),
      200,
    ),
  );
