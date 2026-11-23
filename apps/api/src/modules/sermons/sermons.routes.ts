import {
  createSermonBody,
  createSermonResponse,
  PERMISSIONS,
  sermonListDto,
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
import { createSermon, deleteSermon, listSermons } from "./useCases";

const TAGS = ["sermons"];

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

const idParams = z.object({ id: z.uuid() });

const listRoute = createRoute({
  method: "get",
  path: "/content/sermons",
  tags: TAGS,
  summary:
    "List the sermons with their live and working revisions, preacher, series and platform data (views included).",
  middleware: [requireSession, requirePermission(PERMISSIONS.sermons.view)],
  responses: {
    200: jsonResponse("The sermons, latest preached first", sermonListDto),
    ...guardedResponses,
  },
});

const createRouteDef = createRoute({
  method: "post",
  path: "/content/sermons",
  tags: TAGS,
  summary:
    "Create a sermon from a pasted video: the sermon, its platform link, the series (existing or a minimal new one) and a preloaded DRAFT, all or nothing.",
  middleware: [requireSession, requirePermission(PERMISSIONS.sermons.create)],
  request: {
    body: {
      content: { "application/json": { schema: createSermonBody } },
      required: true,
    },
  },
  responses: {
    201: jsonResponse("The sermon created", createSermonResponse),
    400: problemResponse("The body is not valid or the series does not exist"),
    404: problemResponse("The video does not exist (video_not_found)"),
    409: problemResponse("The video is already linked (video_already_linked)"),
    422: problemResponse(
      "Not a video link (invalid_video_id) or the video is private (video_private)",
    ),
    503: problemResponse("No video platform to ask (platform_unavailable)"),
    ...guardedResponses,
  },
});

const deleteRoute = createRoute({
  method: "delete",
  path: "/content/sermons/{id}",
  tags: TAGS,
  summary:
    "Delete a sermon that is not live, with its video link; a published or paused one is refused (`sermon_live`).",
  middleware: [requireSession, requirePermission(PERMISSIONS.sermons.delete)],
  request: { params: idParams },
  responses: {
    204: { description: "Deleted" },
    404: problemResponse("Not found"),
    409: problemResponse("The sermon has a live revision (sermon_live)"),
    ...guardedResponses,
  },
});

export const sermonsRoutes = createRouter()
  .openapi(listRoute, async (c) =>
    c.json(
      await listSermons(asAuthenticated(c.get("ctx")).organizationId),
      200,
    ),
  )
  .openapi(createRouteDef, async (c) =>
    c.json(
      await createSermon(asAuthenticated(c.get("ctx")), c.req.valid("json")),
      201,
    ),
  )
  .openapi(deleteRoute, async (c) => {
    await deleteSermon(asAuthenticated(c.get("ctx")), c.req.valid("param").id);
    return c.body(null, 204);
  });
