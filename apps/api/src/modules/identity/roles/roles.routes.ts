import {
  createRoleBody,
  PERMISSIONS,
  roleDto,
  updateRoleBody,
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
import {
  createRole,
  deleteRole,
  getRole,
  listRoles,
  updateRole,
} from "./useCases";

const idParams = z.object({ id: z.uuid() });
const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

const listRoute = createRoute({
  method: "get",
  path: "/roles",
  tags: ["roles"],
  summary: "List the roles with their grid.",
  middleware: [requireSession, requirePermission(PERMISSIONS.roles.view)],
  responses: {
    200: jsonResponse("Every role of the organization", z.array(roleDto)),
    ...guardedResponses,
  },
});

const getRoute = createRoute({
  method: "get",
  path: "/roles/{id}",
  tags: ["roles"],
  summary: "One role with its grid.",
  middleware: [requireSession, requirePermission(PERMISSIONS.roles.view)],
  request: { params: idParams },
  responses: {
    200: jsonResponse("The role", roleDto),
    404: problemResponse("Not found"),
    ...guardedResponses,
  },
});

const createRoleRoute = createRoute({
  method: "post",
  path: "/roles",
  tags: ["roles"],
  summary: "Create a role.",
  middleware: [requireSession, requirePermission(PERMISSIONS.roles.create)],
  request: {
    body: {
      content: { "application/json": { schema: createRoleBody } },
      required: true,
    },
  },
  responses: {
    201: jsonResponse("The new role", roleDto),
    400: problemResponse("The grid or the request is not valid"),
    409: problemResponse("The name is taken"),
    ...guardedResponses,
  },
});

const updateRoute = createRoute({
  method: "patch",
  path: "/roles/{id}",
  tags: ["roles"],
  summary: "Replace a role's name, session policy and grid.",
  middleware: [requireSession, requirePermission(PERMISSIONS.roles.edit)],
  request: {
    params: idParams,
    body: {
      content: { "application/json": { schema: updateRoleBody } },
      required: true,
    },
  },
  responses: {
    200: jsonResponse("The updated role", roleDto),
    400: problemResponse("The grid or the request is not valid"),
    404: problemResponse("Not found"),
    409: problemResponse("The name is taken"),
    ...guardedResponses,
  },
});

const deleteRoute = createRoute({
  method: "delete",
  path: "/roles/{id}",
  tags: ["roles"],
  summary: "Delete a custom role without members.",
  middleware: [requireSession, requirePermission(PERMISSIONS.roles.delete)],
  request: { params: idParams },
  responses: {
    204: { description: "Role deleted" },
    404: problemResponse("Not found"),
    409: problemResponse("Seeded role or role with members"),
    ...guardedResponses,
  },
});

export const rolesRoutes = createRouter()
  .openapi(listRoute, async (c) =>
    c.json(await listRoles(asAuthenticated(c.get("ctx"))), 200),
  )
  .openapi(getRoute, async (c) =>
    c.json(
      await getRole(asAuthenticated(c.get("ctx")), c.req.valid("param").id),
      200,
    ),
  )
  .openapi(createRoleRoute, async (c) =>
    c.json(
      await createRole({
        ctx: asAuthenticated(c.get("ctx")),
        body: c.req.valid("json"),
      }),
      201,
    ),
  )
  .openapi(updateRoute, async (c) =>
    c.json(
      await updateRole({
        ctx: asAuthenticated(c.get("ctx")),
        id: c.req.valid("param").id,
        body: c.req.valid("json"),
      }),
      200,
    ),
  )
  .openapi(deleteRoute, async (c) => {
    await deleteRole(asAuthenticated(c.get("ctx")), c.req.valid("param").id);
    return c.body(null, 204);
  });
