import { purgeMediaResultDto } from "@ancla/contracts";
import { createRoute } from "@hono/zod-openapi";
import { createRouter } from "../../core/createApp";
import { jsonResponse, problemResponse } from "../../core/openapi";
import { requireCronSecret } from "./guards";
import { purgeStaleUploads } from "./useCases";

const purgeRoute = createRoute({
  method: "get",
  path: "/internal/media/purge",
  tags: ["internal"],
  summary:
    "Cron job: delete uploads pending for over an hour. Bearer CRON_SECRET, no session.",
  middleware: [requireCronSecret],
  responses: {
    200: jsonResponse(
      "How many stale uploads were removed",
      purgeMediaResultDto,
    ),
    401: problemResponse("Missing or wrong bearer"),
  },
});

export const mediaInternalRoutes = createRouter().openapi(
  purgeRoute,
  async (c) => c.json({ purged: await purgeStaleUploads() }, 200),
);
