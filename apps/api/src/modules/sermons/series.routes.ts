import {
  importSeriesBody,
  PERMISSIONS,
  sermonSeriesDto,
  sermonSeriesListDto,
  updateSermonSeriesBody,
  upsertSermonSeriesBody,
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
  createSermonSeries,
  deleteSermonSeries,
  importSermonSeries,
  listSermonSeries,
  updateSermonSeries,
} from "./useCases";

const TAGS = ["sermons"];

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

const idParams = z.object({ id: z.uuid() });

const listRoute = createRoute({
  method: "get",
  path: "/content/sermon-series",
  tags: TAGS,
  summary:
    "List the series (deleted ones excluded) with the count and date range of their live sermons.",
  middleware: [requireSession, requirePermission(PERMISSIONS.sermons.view)],
  responses: {
    200: jsonResponse("The series", sermonSeriesListDto),
    ...guardedResponses,
  },
});

const createRouteDef = createRoute({
  method: "post",
  path: "/content/sermon-series",
  tags: TAGS,
  summary: "Create a series with its translations.",
  middleware: [requireSession, requirePermission(PERMISSIONS.sermons.edit)],
  request: {
    body: {
      content: { "application/json": { schema: upsertSermonSeriesBody } },
      required: true,
    },
  },
  responses: {
    201: jsonResponse("Created", sermonSeriesDto),
    400: problemResponse(
      "The body is not valid, a language is not enabled or the cover is not valid (invalid_media)",
    ),
    409: problemResponse("A slug is already in use (slug_taken)"),
    ...guardedResponses,
  },
});

const importRoute = createRoute({
  method: "post",
  path: "/content/sermon-series/import",
  tags: TAGS,
  summary:
    "Create the series linked to a YouTube playlist, with its title and description preloaded. It creates no sermons and leaves the cover empty.",
  middleware: [requireSession, requirePermission(PERMISSIONS.sermons.edit)],
  request: {
    body: {
      content: { "application/json": { schema: importSeriesBody } },
      required: true,
    },
  },
  responses: {
    201: jsonResponse("Created", sermonSeriesDto),
    400: problemResponse("The body is not valid"),
    404: problemResponse("The playlist does not exist (playlist_not_found)"),
    409: problemResponse(
      "The playlist is already imported (playlist_already_imported)",
    ),
    422: problemResponse("Not a playlist link (invalid_playlist_id)"),
    503: problemResponse("No video platform to ask (platform_unavailable)"),
    ...guardedResponses,
  },
});

const patchRoute = createRoute({
  method: "patch",
  path: "/content/sermon-series/{id}",
  tags: TAGS,
  summary:
    "Replace the series; `version` is the one read (409 stale_version if it moved).",
  middleware: [requireSession, requirePermission(PERMISSIONS.sermons.edit)],
  request: {
    params: idParams,
    body: {
      content: { "application/json": { schema: updateSermonSeriesBody } },
      required: true,
    },
  },
  responses: {
    200: jsonResponse("After the change", sermonSeriesDto),
    400: problemResponse(
      "The body is not valid, a language is not enabled or the cover is not valid (invalid_media)",
    ),
    404: problemResponse("Not found"),
    409: problemResponse("stale_version or slug_taken"),
    ...guardedResponses,
  },
});

const deleteRoute = createRoute({
  method: "delete",
  path: "/content/sermon-series/{id}",
  tags: TAGS,
  summary:
    "Delete logically; refused while a sermon belongs to it (series_in_use).",
  middleware: [requireSession, requirePermission(PERMISSIONS.sermons.edit)],
  request: { params: idParams },
  responses: {
    204: { description: "Deleted" },
    404: problemResponse("Not found"),
    409: problemResponse("A sermon belongs to it (series_in_use)"),
    ...guardedResponses,
  },
});

export const sermonSeriesRoutes = createRouter()
  .openapi(listRoute, async (c) =>
    c.json(
      await listSermonSeries(asAuthenticated(c.get("ctx")).organizationId),
      200,
    ),
  )
  .openapi(createRouteDef, async (c) =>
    c.json(
      await createSermonSeries(
        asAuthenticated(c.get("ctx")),
        c.req.valid("json"),
      ),
      201,
    ),
  )
  .openapi(importRoute, async (c) =>
    c.json(
      await importSermonSeries(
        asAuthenticated(c.get("ctx")),
        c.req.valid("json"),
      ),
      201,
    ),
  )
  .openapi(patchRoute, async (c) =>
    c.json(
      await updateSermonSeries(
        asAuthenticated(c.get("ctx")),
        c.req.valid("param").id,
        c.req.valid("json"),
      ),
      200,
    ),
  )
  .openapi(deleteRoute, async (c) => {
    await deleteSermonSeries(
      asAuthenticated(c.get("ctx")),
      c.req.valid("param").id,
    );
    return c.body(null, 204);
  });
