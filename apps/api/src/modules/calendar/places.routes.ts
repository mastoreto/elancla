import {
  PERMISSIONS,
  placeDto,
  placeListDto,
  updatePlaceBody,
  upsertPlaceBody,
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
import { createPlace, deletePlace, listPlaces, updatePlace } from "./useCases";

const TAGS = ["calendar"];

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

const idParams = z.object({ id: z.uuid() });

const listRoute = createRoute({
  method: "get",
  path: "/content/calendar/places",
  tags: TAGS,
  summary: "List the places (deleted ones excluded).",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.view)],
  responses: {
    200: jsonResponse("The places", placeListDto),
    ...guardedResponses,
  },
});

const createRouteDef = createRoute({
  method: "post",
  path: "/content/calendar/places",
  tags: TAGS,
  summary: "Create a place with its translations.",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.edit)],
  request: {
    body: {
      content: { "application/json": { schema: upsertPlaceBody } },
      required: true,
    },
  },
  responses: {
    201: jsonResponse("Created", placeDto),
    400: problemResponse("The body is not valid or a language is not enabled"),
    ...guardedResponses,
  },
});

const patchRoute = createRoute({
  method: "patch",
  path: "/content/calendar/places/{id}",
  tags: TAGS,
  summary:
    "Replace the place; `version` is the one read (409 `stale_version` if it moved).",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.edit)],
  request: {
    params: idParams,
    body: {
      content: { "application/json": { schema: updatePlaceBody } },
      required: true,
    },
  },
  responses: {
    200: jsonResponse("After the change", placeDto),
    400: problemResponse("The body is not valid or a language is not enabled"),
    404: problemResponse("Not found"),
    409: problemResponse("stale_version"),
    ...guardedResponses,
  },
});

const deleteRoute = createRoute({
  method: "delete",
  path: "/content/calendar/places/{id}",
  tags: TAGS,
  summary:
    "Delete logically; refused while an activity uses it (`place_in_use`).",
  middleware: [requireSession, requirePermission(PERMISSIONS.events.edit)],
  request: { params: idParams },
  responses: {
    204: { description: "Deleted" },
    404: problemResponse("Not found"),
    409: problemResponse("An activity uses it (place_in_use)"),
    ...guardedResponses,
  },
});

export const placesRoutes = createRouter()
  .openapi(listRoute, async (c) =>
    c.json(await listPlaces(asAuthenticated(c.get("ctx")).organizationId), 200),
  )
  .openapi(createRouteDef, async (c) =>
    c.json(
      await createPlace(asAuthenticated(c.get("ctx")), c.req.valid("json")),
      201,
    ),
  )
  .openapi(patchRoute, async (c) =>
    c.json(
      await updatePlace(
        asAuthenticated(c.get("ctx")),
        c.req.valid("param").id,
        c.req.valid("json"),
      ),
      200,
    ),
  )
  .openapi(deleteRoute, async (c) => {
    await deletePlace(asAuthenticated(c.get("ctx")), c.req.valid("param").id);
    return c.body(null, 204);
  });
