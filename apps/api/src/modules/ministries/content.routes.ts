import {
  createMinistryBody,
  createMinistryResponse,
  ministryLandingBody,
  ministryLeadersBody,
  ministryLeadersDto,
  ministryListDto,
  ministryListItemDto,
  ministrySettingsBody,
  PERMISSIONS,
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
  createMinistry,
  listMinistryItems,
  replaceMinistryLeaders,
  updateMinistryLanding,
  updateMinistrySettings,
} from "./useCases";

const TAGS = ["ministries"];

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

const idParams = z.object({ id: z.uuid() });

const jsonBody = <Schema extends z.ZodType>(schema: Schema) =>
  ({ content: { "application/json": { schema } }, required: true }) as const;

const listRoute = createRoute({
  method: "get",
  path: "/content/ministries",
  tags: TAGS,
  summary:
    "List the ministries with their settings and the editorial state of their profile (a ministry scope sees only its own).",
  middleware: [
    requireSession,
    requirePermission(PERMISSIONS.ministryProfile.view),
  ],
  responses: {
    200: jsonResponse("The ministries, by name", ministryListDto),
    ...guardedResponses,
  },
});

const createRouteDef = createRoute({
  method: "post",
  path: "/content/ministries",
  tags: TAGS,
  summary:
    "Create an empty ministry (needs the all scope); its profile goes through /editorial/ministry/{id}/draft.",
  middleware: [
    requireSession,
    requirePermission(PERMISSIONS.ministryProfile.create),
  ],
  request: { body: jsonBody(createMinistryBody) },
  responses: {
    201: jsonResponse("The ministry created", createMinistryResponse),
    400: problemResponse("The body is not valid"),
    ...guardedResponses,
  },
});

const settingsRoute = createRoute({
  method: "patch",
  path: "/content/ministries/{id}/settings",
  tags: TAGS,
  summary:
    "Category, destination, icon and color (needs the all scope); `version` is the one read (409 stale_version if it moved).",
  middleware: [
    requireSession,
    requirePermission(PERMISSIONS.ministryProfile.edit),
  ],
  request: { params: idParams, body: jsonBody(ministrySettingsBody) },
  responses: {
    200: jsonResponse("After the change", ministryListItemDto),
    400: problemResponse(
      "The body is not valid or the category does not exist",
    ),
    404: problemResponse("Not found"),
    409: problemResponse("stale_version"),
    ...guardedResponses,
  },
});

const leadersRoute = createRoute({
  method: "put",
  path: "/content/ministries/{id}/leaders",
  tags: TAGS,
  summary:
    "Replace the leaders of a ministry (needs the all scope); at most 12 people of the organization.",
  middleware: [
    requireSession,
    requirePermission(PERMISSIONS.ministryProfile.edit),
  ],
  request: { params: idParams, body: jsonBody(ministryLeadersBody) },
  responses: {
    200: jsonResponse("The leaders after the change", ministryLeadersDto),
    400: problemResponse("A language is not enabled or a person is not valid"),
    404: problemResponse("Not found"),
    ...guardedResponses,
  },
});

const landingRoute = createRoute({
  method: "patch",
  path: "/content/ministries/landing",
  tags: TAGS,
  summary:
    "Update the landing mosaic of the listed ministries in one transaction (needs the all scope).",
  middleware: [
    requireSession,
    requirePermission(PERMISSIONS.ministryProfile.edit),
  ],
  request: { body: jsonBody(ministryLandingBody) },
  responses: {
    200: jsonResponse("Every ministry after the change", ministryListDto),
    400: problemResponse("The body is not valid or a photo is not valid"),
    404: problemResponse("A ministry was not found"),
    ...guardedResponses,
  },
});

export const ministryContentRoutes = createRouter()
  .openapi(listRoute, async (c) =>
    c.json(await listMinistryItems(asAuthenticated(c.get("ctx"))), 200),
  )
  .openapi(createRouteDef, async (c) =>
    c.json(
      await createMinistry(asAuthenticated(c.get("ctx")), c.req.valid("json")),
      201,
    ),
  )
  .openapi(settingsRoute, async (c) =>
    c.json(
      await updateMinistrySettings(
        asAuthenticated(c.get("ctx")),
        c.req.valid("param").id,
        c.req.valid("json"),
      ),
      200,
    ),
  )
  .openapi(leadersRoute, async (c) =>
    c.json(
      await replaceMinistryLeaders(
        asAuthenticated(c.get("ctx")),
        c.req.valid("param").id,
        c.req.valid("json"),
      ),
      200,
    ),
  )
  .openapi(landingRoute, async (c) =>
    c.json(
      await updateMinistryLanding(
        asAuthenticated(c.get("ctx")),
        c.req.valid("json"),
      ),
      200,
    ),
  );
