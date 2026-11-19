import {
  pageQuerySchema,
  pageSchema,
  setUserMinistriesBody,
  setUserRolesBody,
  userDto,
} from "@ancla/contracts";
import { createRoute, z } from "@hono/zod-openapi";
import { requireSession } from "../../../core/auth";
import { requirePermission } from "../../../core/authz";
import type { AuthenticatedContext } from "../../../core/context";
import { createRouter } from "../../../core/createApp";
import {
  guardedResponses,
  jsonResponse,
  problemResponse,
} from "../../../core/openapi";
import { listUsers, setUserMinistries, setUserRoles } from "./useCases";

const idParams = z.object({ id: z.uuid() });
const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

const listRoute = createRoute({
  method: "get",
  path: "/users",
  tags: ["users"],
  summary: "List users with their roles, ministries and last access.",
  middleware: [requireSession, requirePermission("users:view")],
  request: { query: pageQuerySchema },
  responses: {
    200: jsonResponse("A page of users", pageSchema(userDto)),
    ...guardedResponses,
  },
});

const setRolesRoute = createRoute({
  method: "put",
  path: "/users/{id}/roles",
  tags: ["users"],
  summary: "Replace the roles of a user.",
  middleware: [requireSession, requirePermission("users:edit")],
  request: {
    params: idParams,
    body: {
      content: { "application/json": { schema: setUserRolesBody } },
      required: true,
    },
  },
  responses: {
    200: jsonResponse("The updated user", userDto),
    400: problemResponse("Unknown role"),
    404: problemResponse("Not found"),
    409: problemResponse("The last admin cannot lose the role"),
    ...guardedResponses,
  },
});

const setMinistriesRoute = createRoute({
  method: "put",
  path: "/users/{id}/ministries",
  tags: ["users"],
  summary: "Replace the ministries of a user.",
  middleware: [requireSession, requirePermission("users:edit")],
  request: {
    params: idParams,
    body: {
      content: { "application/json": { schema: setUserMinistriesBody } },
      required: true,
    },
  },
  responses: {
    200: jsonResponse("The updated user", userDto),
    400: problemResponse("Unknown ministry"),
    404: problemResponse("Not found"),
    ...guardedResponses,
  },
});

export const usersRoutes = createRouter()
  .openapi(listRoute, async (c) =>
    c.json(await listUsers(c.req.valid("query")), 200),
  )
  .openapi(setRolesRoute, async (c) =>
    c.json(
      await setUserRoles({
        ctx: asAuthenticated(c.get("ctx")),
        userId: c.req.valid("param").id,
        body: c.req.valid("json"),
      }),
      200,
    ),
  )
  .openapi(setMinistriesRoute, async (c) =>
    c.json(
      await setUserMinistries({
        ctx: asAuthenticated(c.get("ctx")),
        userId: c.req.valid("param").id,
        body: c.req.valid("json"),
      }),
      200,
    ),
  );
