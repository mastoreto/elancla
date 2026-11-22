import { createRoute, z } from "@hono/zod-openapi";
import { createRouter } from "../../core/createApp";
import { jsonResponse, problemResponse } from "../../core/openapi";
import { requireCronSecret } from "../media";
import { sendCalendarReminders } from "./useCases";

const remindersRoute = createRoute({
  method: "get",
  path: "/internal/calendar/reminders",
  tags: ["internal"],
  summary:
    "Cron job: email the yearly calendar reminder on the days it is due. Bearer CRON_SECRET, no session. Outside production `?now=<ISO datetime>` simulates the date.",
  middleware: [requireCronSecret],
  request: { query: z.object({ now: z.iso.datetime().optional() }) },
  responses: {
    200: jsonResponse(
      "How many emails went out",
      z.object({ sent: z.number().int().nonnegative() }),
    ),
    400: problemResponse("`now` is not an ISO datetime"),
    401: problemResponse("Missing or wrong bearer"),
  },
});

/** ponytail: the simulated date exists to test the cadence by hand; production ignores it. */
const effectiveNow = (simulated: string | undefined): Date =>
  simulated && process.env.NODE_ENV !== "production"
    ? new Date(simulated)
    : new Date();

export const calendarInternalRoutes = createRouter().openapi(
  remindersRoute,
  async (c) =>
    c.json(
      {
        sent: await sendCalendarReminders(
          effectiveNow(c.req.valid("query").now),
        ),
      },
      200,
    ),
);
