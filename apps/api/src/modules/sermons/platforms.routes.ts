import {
  PERMISSIONS,
  platformLookupBody,
  platformLookupDto,
  platformSuggestionListDto,
} from "@ancla/contracts";
import { createRoute } from "@hono/zod-openapi";
import { requireSession } from "../../core/auth";
import { requireAnyPermission } from "../../core/authz";
import type { AuthenticatedContext } from "../../core/context";
import { createRouter } from "../../core/createApp";
import {
  guardedResponses,
  jsonResponse,
  problemResponse,
} from "../../core/openapi";
import { listPlatformSuggestions, lookupVideo } from "./useCases";

const TAGS = ["sermons"];

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

/** Whoever may create a sermon or a podcast episode may look a video up. */
const canPickVideo = requireAnyPermission(
  PERMISSIONS.sermons.create,
  PERMISSIONS.podcasts.create,
);

const lookupRoute = createRoute({
  method: "post",
  path: "/content/platform-lookup",
  tags: TAGS,
  summary:
    "Preview a pasted video (URL or id) before creating anything: title, description, cover, duration, date, and whether it is already linked.",
  middleware: [requireSession, canPickVideo],
  request: {
    body: {
      content: { "application/json": { schema: platformLookupBody } },
      required: true,
    },
  },
  responses: {
    200: jsonResponse("What the platform says", platformLookupDto),
    400: problemResponse("The body is not valid"),
    404: problemResponse("The video does not exist (video_not_found)"),
    422: problemResponse(
      "Not a video link (invalid_video_id) or the video is private (video_private)",
    ),
    503: problemResponse("No video platform to ask (platform_unavailable)"),
    ...guardedResponses,
  },
});

const suggestionsRoute = createRoute({
  method: "get",
  path: "/content/platform/suggestions",
  tags: TAGS,
  summary:
    "The latest uploads of the church's channel that are not linked yet (cached 10 minutes). It creates nothing.",
  middleware: [requireSession, canPickVideo],
  responses: {
    200: jsonResponse("Up to 50 recent uploads", platformSuggestionListDto),
    503: problemResponse("No video platform to ask (platform_unavailable)"),
    ...guardedResponses,
  },
});

export const platformsRoutes = createRouter()
  .openapi(lookupRoute, async (c) =>
    c.json(
      await lookupVideo(asAuthenticated(c.get("ctx")), c.req.valid("json")),
      200,
    ),
  )
  .openapi(suggestionsRoute, async (c) =>
    c.json(await listPlatformSuggestions(asAuthenticated(c.get("ctx"))), 200),
  );
