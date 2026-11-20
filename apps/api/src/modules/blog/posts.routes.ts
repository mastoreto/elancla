import { createPostResponse, PERMISSIONS, postListDto } from "@ancla/contracts";
import { createRoute } from "@hono/zod-openapi";
import { requireSession } from "../../core/auth";
import { requirePermission } from "../../core/authz";
import type { AuthenticatedContext } from "../../core/context";
import { createRouter } from "../../core/createApp";
import { guardedResponses, jsonResponse } from "../../core/openapi";
import { createPost, listPosts } from "./useCases";

const TAGS = ["blog"];

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

const listRoute = createRoute({
  method: "get",
  path: "/content/posts",
  tags: TAGS,
  summary:
    "List the posts with their live and working revisions, category, author and views.",
  middleware: [requireSession, requirePermission(PERMISSIONS.blogPosts.view)],
  responses: {
    200: jsonResponse("The posts, newest first", postListDto),
    ...guardedResponses,
  },
});

const createRouteDef = createRoute({
  method: "post",
  path: "/content/posts",
  tags: TAGS,
  summary:
    "Create an empty post; its content goes through /editorial/blog-post/{id}/draft.",
  middleware: [requireSession, requirePermission(PERMISSIONS.blogPosts.create)],
  responses: {
    201: jsonResponse("The post created", createPostResponse),
    ...guardedResponses,
  },
});

export const postsRoutes = createRouter()
  .openapi(listRoute, async (c) =>
    c.json(await listPosts(asAuthenticated(c.get("ctx")).organizationId), 200),
  )
  .openapi(createRouteDef, async (c) =>
    c.json(await createPost(asAuthenticated(c.get("ctx"))), 201),
  );
