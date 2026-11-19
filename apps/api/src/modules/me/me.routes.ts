import { createPasswordBody, meDto, problemSchema } from "@ancla/contracts";
import { createRoute } from "@hono/zod-openapi";
import { requireFreshSession, requireSession } from "../../core/auth";
import type { AuthenticatedContext } from "../../core/context";
import { createRouter } from "../../core/createApp";
import { createPassword, getMe } from "./useCases";

const problemResponse = (description: string) => ({
  description,
  content: { "application/problem+json": { schema: problemSchema } },
});

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
    401: problemResponse("No valid session"),
  },
});

const createPasswordRoute = createRoute({
  method: "post",
  path: "/me/password",
  tags: ["me"],
  summary:
    "Create the first password of an account that signed up with Google.",
  middleware: [requireSession, requireFreshSession],
  request: {
    body: {
      content: { "application/json": { schema: createPasswordBody } },
      required: true,
    },
  },
  responses: {
    204: { description: "Password created" },
    401: problemResponse("No valid session"),
    403: problemResponse("The session is too old: sign in again"),
    409: problemResponse("The account already has a password"),
  },
});

export const meRoutes = createRouter()
  // requireSession guarantees user and organization.
  .openapi(getMeRoute, async (c) =>
    c.json(await getMe(c.get("ctx") as AuthenticatedContext), 200),
  )
  .openapi(createPasswordRoute, async (c) => {
    await createPassword({
      ctx: c.get("ctx") as AuthenticatedContext,
      body: c.req.valid("json"),
      headers: c.req.raw.headers,
    });
    return c.body(null, 204);
  });
