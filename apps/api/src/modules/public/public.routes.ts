import { publicLocaleQuery, publicSiteSettingsDto } from "@ancla/contracts";
import { createRoute, z } from "@hono/zod-openapi";
import { allowPublic } from "../../core/authz";
import { createRouter } from "../../core/createApp";
import {
  jsonResponse,
  problemResponse,
  publicOpenApiConfig,
} from "../../core/openapi";
import { requireSiteKey } from "./guards";
import { getPublicSiteSettings } from "./useCases";

/** Content is public by nature: the CDN may keep it a minute and serve it stale for five more. */
export const PUBLIC_CACHE_CONTROL =
  "public, s-maxage=60, stale-while-revalidate=300";

const churchParams = z.object({ churchSlug: z.string() });

const settingsRoute = createRoute({
  method: "get",
  path: "/{churchSlug}/settings",
  tags: ["settings"],
  summary: "The site settings of a church, in the requested language.",
  middleware: [requireSiteKey],
  request: { params: churchParams, query: publicLocaleQuery },
  responses: {
    200: jsonResponse("The site settings", publicSiteSettingsDto),
    400: problemResponse("The locale is not valid"),
    401: problemResponse(
      "The site key is missing, invalid or not for this church",
    ),
    404: problemResponse("The church has no site settings"),
  },
});

export const publicRoutes = createRouter().openapi(settingsRoute, async (c) => {
  const { organizationId } = c.get("ctx");
  const settings = await getPublicSiteSettings(
    organizationId as string,
    c.req.valid("query").locale,
  );
  c.header("Cache-Control", PUBLIC_CACHE_CONTROL);
  return c.json(settings, 200);
});

// The document describes only these routes (this router's registry), never the private ones.
publicRoutes.get("/openapi.json", allowPublic, (c) => {
  c.header("Cache-Control", PUBLIC_CACHE_CONTROL);
  return c.json(publicRoutes.getOpenAPI31Document(publicOpenApiConfig));
});
