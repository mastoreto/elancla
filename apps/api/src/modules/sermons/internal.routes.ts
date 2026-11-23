import { createRoute, z } from "@hono/zod-openapi";
import { createRouter } from "../../core/createApp";
import { jsonResponse, problemResponse } from "../../core/openapi";
import { requireCronSecret } from "../media";
import { refreshPlatformLinks } from "./useCases";

const refreshRoute = createRoute({
  method: "get",
  path: "/internal/platforms/refresh",
  tags: ["internal"],
  summary:
    "Cron job: refresh cover, duration, views and original date of every YouTube link, 50 videos per request. Bearer CRON_SECRET, no session.",
  middleware: [requireCronSecret],
  responses: {
    200: jsonResponse(
      "How many links were refreshed",
      z.object({ refreshed: z.number().int().nonnegative() }),
    ),
    401: problemResponse("Missing or wrong bearer"),
    503: problemResponse(
      "The platform could not answer (platform_unavailable)",
    ),
  },
});

export const platformsInternalRoutes = createRouter().openapi(
  refreshRoute,
  async (c) => c.json({ refreshed: await refreshPlatformLinks() }, 200),
);
