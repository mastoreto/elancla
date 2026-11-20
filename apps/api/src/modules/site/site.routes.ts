import {
  PERMISSIONS,
  type Permission,
  siteSettingsDto,
  updateSiteSettingsBody,
} from "@ancla/contracts";
import { createRoute } from "@hono/zod-openapi";
import { requireSession } from "../../core/auth";
import { requirePermission } from "../../core/authz";
import type { AuthenticatedContext } from "../../core/context";
import { createRouter } from "../../core/createApp";
import {
  guardedResponses,
  jsonResponse,
  problemResponse,
} from "../../core/openapi";
import { getSiteSettings, updateSiteSettings } from "./useCases";

const TAGS = ["site"];

const can = (permission: Permission) => [
  requireSession,
  requirePermission(permission),
];

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

// Literal paths, one route per verb: the typed client infers `site.settings.$get` / `$patch`.
const getRoute = createRoute({
  method: "get",
  path: "/site/settings",
  tags: TAGS,
  summary: "The site settings as the CRM edits them.",
  middleware: can(PERMISSIONS.site.view),
  responses: {
    200: jsonResponse("The site settings", siteSettingsDto),
    404: problemResponse("The organization has no site settings"),
    ...guardedResponses,
  },
});

const patchRoute = createRoute({
  method: "patch",
  path: "/site/settings",
  tags: TAGS,
  summary: "Change part of the site settings (needs the `version` you loaded).",
  middleware: can(PERMISSIONS.site.edit),
  request: {
    body: {
      content: { "application/json": { schema: updateSiteSettingsBody } },
      required: true,
    },
  },
  responses: {
    200: jsonResponse("The site settings after the change", siteSettingsDto),
    400: problemResponse(
      "The request is not valid or uses a disabled language",
    ),
    404: problemResponse("The organization has no site settings"),
    409: problemResponse("The settings changed since they were loaded"),
    ...guardedResponses,
  },
});

export const siteRoutes = createRouter()
  .openapi(getRoute, async (c) =>
    c.json(
      await getSiteSettings(asAuthenticated(c.get("ctx")).organizationId),
      200,
    ),
  )
  .openapi(patchRoute, async (c) =>
    c.json(
      await updateSiteSettings(
        asAuthenticated(c.get("ctx")),
        c.req.valid("json"),
      ),
      200,
    ),
  );
