import {
  ministryCategoryDto,
  ministryCategoryListDto,
  PERMISSIONS,
  updateMinistryCategoryBody,
  upsertMinistryCategoryBody,
} from "@ancla/contracts";
import { createRoute, z } from "@hono/zod-openapi";
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
  createMinistryCategory,
  deleteMinistryCategory,
  listMinistryCategories,
  updateMinistryCategory,
} from "./useCases";

const TAGS = ["ministries"];

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

const idParams = z.object({ id: z.uuid() });

const listRoute = createRoute({
  method: "get",
  path: "/content/ministry-categories",
  tags: TAGS,
  summary: "List the ministry categories (deleted ones excluded).",
  middleware: [
    requireSession,
    requirePermission(PERMISSIONS.ministryProfile.view),
  ],
  responses: {
    200: jsonResponse("The categories", ministryCategoryListDto),
    ...guardedResponses,
  },
});

const createRouteDef = createRoute({
  method: "post",
  path: "/content/ministry-categories",
  tags: TAGS,
  summary: "Create a category with its translations (needs the all scope).",
  middleware: [
    requireSession,
    requirePermission(PERMISSIONS.ministryProfile.edit),
  ],
  request: {
    body: {
      content: { "application/json": { schema: upsertMinistryCategoryBody } },
      required: true,
    },
  },
  responses: {
    201: jsonResponse("Created", ministryCategoryDto),
    400: problemResponse("The body is not valid or a language is not enabled"),
    ...guardedResponses,
  },
});

const patchRoute = createRoute({
  method: "patch",
  path: "/content/ministry-categories/{id}",
  tags: TAGS,
  summary:
    "Replace the translations (needs the all scope); `version` is the one read (409 stale_version if it moved).",
  middleware: [
    requireSession,
    requirePermission(PERMISSIONS.ministryProfile.edit),
  ],
  request: {
    params: idParams,
    body: {
      content: { "application/json": { schema: updateMinistryCategoryBody } },
      required: true,
    },
  },
  responses: {
    200: jsonResponse("After the change", ministryCategoryDto),
    400: problemResponse("The body is not valid or a language is not enabled"),
    404: problemResponse("Not found"),
    409: problemResponse("stale_version"),
    ...guardedResponses,
  },
});

const deleteRoute = createRoute({
  method: "delete",
  path: "/content/ministry-categories/{id}",
  tags: TAGS,
  summary:
    "Delete logically (needs the all scope); refused while a ministry uses it (category_in_use).",
  middleware: [
    requireSession,
    requirePermission(PERMISSIONS.ministryProfile.edit),
  ],
  request: { params: idParams },
  responses: {
    204: { description: "Deleted" },
    404: problemResponse("Not found"),
    409: problemResponse("A ministry uses it (category_in_use)"),
    ...guardedResponses,
  },
});

export const ministryCategoriesRoutes = createRouter()
  .openapi(listRoute, async (c) =>
    c.json(
      await listMinistryCategories(
        asAuthenticated(c.get("ctx")).organizationId,
      ),
      200,
    ),
  )
  .openapi(createRouteDef, async (c) =>
    c.json(
      await createMinistryCategory(
        asAuthenticated(c.get("ctx")),
        c.req.valid("json"),
      ),
      201,
    ),
  )
  .openapi(patchRoute, async (c) =>
    c.json(
      await updateMinistryCategory(
        asAuthenticated(c.get("ctx")),
        c.req.valid("param").id,
        c.req.valid("json"),
      ),
      200,
    ),
  )
  .openapi(deleteRoute, async (c) => {
    await deleteMinistryCategory(
      asAuthenticated(c.get("ctx")),
      c.req.valid("param").id,
    );
    return c.body(null, 204);
  });
