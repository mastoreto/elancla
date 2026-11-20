import {
  categoryDto,
  categoryListDto,
  PERMISSIONS,
  updateCategoryBody,
  upsertCategoryBody,
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
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "./useCases";

const TAGS = ["blog"];

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

const idParams = z.object({ id: z.uuid() });

const listRoute = createRoute({
  method: "get",
  path: "/content/categories",
  tags: TAGS,
  summary: "List the categories (deleted ones excluded).",
  middleware: [requireSession, requirePermission(PERMISSIONS.blogPosts.view)],
  responses: {
    200: jsonResponse("The categories", categoryListDto),
    ...guardedResponses,
  },
});

const createRouteDef = createRoute({
  method: "post",
  path: "/content/categories",
  tags: TAGS,
  summary: "Create a categories entry with its translations.",
  middleware: [requireSession, requirePermission(PERMISSIONS.blogPosts.edit)],
  request: {
    body: {
      content: { "application/json": { schema: upsertCategoryBody } },
      required: true,
    },
  },
  responses: {
    201: jsonResponse("Created", categoryDto),
    400: problemResponse("The body is not valid or a language is not enabled"),
    409: problemResponse("A slug is already in use (slug_taken)"),
    ...guardedResponses,
  },
});

const patchRoute = createRoute({
  method: "patch",
  path: "/content/categories/{id}",
  tags: TAGS,
  summary:
    "Replace the translations; `version` is the one read (409 stale_version if it moved).",
  middleware: [requireSession, requirePermission(PERMISSIONS.blogPosts.edit)],
  request: {
    params: idParams,
    body: {
      content: { "application/json": { schema: updateCategoryBody } },
      required: true,
    },
  },
  responses: {
    200: jsonResponse("After the change", categoryDto),
    400: problemResponse("The body is not valid or a language is not enabled"),
    404: problemResponse("Not found"),
    409: problemResponse("stale_version or slug_taken"),
    ...guardedResponses,
  },
});

const deleteRoute = createRoute({
  method: "delete",
  path: "/content/categories/{id}",
  tags: TAGS,
  summary:
    "Delete logically; refused while a published post uses it (category_in_use).",
  middleware: [requireSession, requirePermission(PERMISSIONS.blogPosts.edit)],
  request: { params: idParams },
  responses: {
    204: { description: "Deleted" },
    404: problemResponse("Not found"),
    409: problemResponse("A published post uses it (category_in_use)"),
    ...guardedResponses,
  },
});

export const categoriesRoutes = createRouter()
  .openapi(listRoute, async (c) =>
    c.json(
      await listCategories(asAuthenticated(c.get("ctx")).organizationId),
      200,
    ),
  )
  .openapi(createRouteDef, async (c) =>
    c.json(
      await createCategory(asAuthenticated(c.get("ctx")), c.req.valid("json")),
      201,
    ),
  )
  .openapi(patchRoute, async (c) =>
    c.json(
      await updateCategory(
        asAuthenticated(c.get("ctx")),
        c.req.valid("param").id,
        c.req.valid("json"),
      ),
      200,
    ),
  )
  .openapi(deleteRoute, async (c) => {
    await deleteCategory(
      asAuthenticated(c.get("ctx")),
      c.req.valid("param").id,
    );
    return c.body(null, 204);
  });
