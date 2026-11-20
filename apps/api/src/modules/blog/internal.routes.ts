import { createRoute, z } from "@hono/zod-openapi";
import { createRouter } from "../../core/createApp";
import { jsonResponse, problemResponse } from "../../core/openapi";
import { requireCronSecret } from "../media";
import { purgeViewVisitors } from "./useCases";

const purgeViewsRoute = createRoute({
  method: "get",
  path: "/internal/blog/views/purge",
  tags: ["internal"],
  summary:
    "Cron job: delete the anonymous visitors of past days. Bearer CRON_SECRET, no session.",
  middleware: [requireCronSecret],
  responses: {
    200: jsonResponse(
      "How many visitor rows were removed",
      z.object({ purged: z.number().int().nonnegative() }),
    ),
    401: problemResponse("Missing or wrong bearer"),
  },
});

export const blogInternalRoutes = createRouter().openapi(
  purgeViewsRoute,
  async (c) => c.json({ purged: await purgeViewVisitors() }, 200),
);
