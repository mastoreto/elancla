import { meDto, problemSchema } from "@ancla/contracts";
import { createRoute } from "@hono/zod-openapi";
import { requireSession } from "../../core/auth";
import type { AuthenticatedContext } from "../../core/context";
import { createRouter } from "../../core/createApp";
import { getMe } from "./useCases";

const getMeRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["me"],
  summary: "The authenticated user.",
  middleware: [requireSession],
  responses: {
    200: {
      description: "Current user",
      content: { "application/json": { schema: meDto } },
    },
    401: {
      description: "No valid session",
      content: { "application/problem+json": { schema: problemSchema } },
    },
  },
});

export const meRoutes = createRouter().openapi(getMeRoute, (c) =>
  // requireSession guarantees user and organization.
  c.json(getMe(c.get("ctx") as AuthenticatedContext), 200),
);
