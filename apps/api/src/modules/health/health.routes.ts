import { healthDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import { createRoute } from "@hono/zod-openapi";
import { createRouter } from "../../core/createApp";
import { checkHealth } from "./useCases";

const getHealthRoute = createRoute({
  method: "get",
  path: "/health",
  tags: ["health"],
  summary: "Liveness and database reachability. Public.",
  responses: {
    200: {
      description: "Service status",
      content: { "application/json": { schema: healthDto } },
    },
  },
});

export const healthRoutes = createRouter().openapi(getHealthRoute, async (c) =>
  c.json(await checkHealth(db), 200),
);
