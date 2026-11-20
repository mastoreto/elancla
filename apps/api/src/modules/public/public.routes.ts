import {
  publicLocaleQuery,
  publicPageDto,
  publicPageListDto,
  publicPageQuery,
  publicPeopleQuery,
  publicPersonDto,
  publicSiteSettingsDto,
  publicVisitDto,
} from "@ancla/contracts";
import { createRoute, z } from "@hono/zod-openapi";
import { allowPublic } from "../../core/authz";
import { createRouter } from "../../core/createApp";
import {
  jsonResponse,
  problemResponse,
  publicOpenApiConfig,
} from "../../core/openapi";
import { requireSiteKey } from "./guards";
import {
  getPublicPage,
  getPublicPages,
  getPublicPeople,
  getPublicSiteSettings,
  getPublicVisit,
} from "./useCases";

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

const peopleRoute = createRoute({
  method: "get",
  path: "/{churchSlug}/people",
  tags: ["people"],
  summary:
    "The people shown in a context (`team`, `preacher`...), in the requested language.",
  middleware: [requireSiteKey],
  request: { params: churchParams, query: publicPeopleQuery },
  responses: {
    200: jsonResponse(
      "The visible people of the context",
      z.array(publicPersonDto),
    ),
    400: problemResponse(
      "The context is missing or not valid, or the locale is not valid",
    ),
    401: problemResponse(
      "The site key is missing, invalid or not for this church",
    ),
    404: problemResponse("The church was not found"),
  },
});

const visitRoute = createRoute({
  method: "get",
  path: "/{churchSlug}/visit",
  tags: ["visit"],
  summary:
    "The directions and FAQ of the visit page, in the requested language.",
  middleware: [requireSiteKey],
  request: { params: churchParams, query: publicLocaleQuery },
  responses: {
    200: jsonResponse("The visit page content", publicVisitDto),
    400: problemResponse("The locale is not valid"),
    401: problemResponse(
      "The site key is missing, invalid or not for this church",
    ),
    404: problemResponse("The church was not found"),
  },
});

const pagesRoute = createRoute({
  method: "get",
  path: "/{churchSlug}/pages",
  tags: ["pages"],
  summary:
    "The published simple pages (title and slug), in the requested language.",
  middleware: [requireSiteKey],
  request: { params: churchParams, query: publicPageQuery },
  responses: {
    200: jsonResponse("The published pages, by title", publicPageListDto),
    400: problemResponse("The locale is not valid"),
    401: problemResponse(
      "The site key is missing, invalid or not for this church",
    ),
    404: problemResponse("The church was not found"),
  },
});

const pageRoute = createRoute({
  method: "get",
  path: "/{churchSlug}/pages/{slug}",
  tags: ["pages"],
  summary:
    "A published simple page by its slug (in any of its languages), in the requested language.",
  middleware: [requireSiteKey],
  request: {
    params: churchParams.extend({ slug: z.string() }),
    query: publicPageQuery,
  },
  responses: {
    200: jsonResponse("The page", publicPageDto),
    400: problemResponse("The locale is not valid"),
    401: problemResponse(
      "The site key is missing, invalid or not for this church",
    ),
    404: problemResponse("There is no published page with that slug"),
  },
});

export const publicRoutes = createRouter()
  .openapi(settingsRoute, async (c) => {
    const { organizationId } = c.get("ctx");
    const settings = await getPublicSiteSettings(
      organizationId as string,
      c.req.valid("query").locale,
    );
    c.header("Cache-Control", PUBLIC_CACHE_CONTROL);
    return c.json(settings, 200);
  })
  .openapi(peopleRoute, async (c) => {
    const { organizationId } = c.get("ctx");
    const { context, locale } = c.req.valid("query");
    const people = await getPublicPeople({
      organizationId: organizationId as string,
      context,
      requestedLocale: locale,
    });
    c.header("Cache-Control", PUBLIC_CACHE_CONTROL);
    return c.json(people, 200);
  })
  .openapi(visitRoute, async (c) => {
    const { organizationId } = c.get("ctx");
    const visit = await getPublicVisit({
      organizationId: organizationId as string,
      requestedLocale: c.req.valid("query").locale,
    });
    c.header("Cache-Control", PUBLIC_CACHE_CONTROL);
    return c.json(visit, 200);
  })
  .openapi(pagesRoute, async (c) => {
    const { organizationId } = c.get("ctx");
    const pages = await getPublicPages({
      organizationId: organizationId as string,
      requestedLocale: c.req.valid("query").locale,
    });
    c.header("Cache-Control", PUBLIC_CACHE_CONTROL);
    return c.json(pages, 200);
  })
  .openapi(pageRoute, async (c) => {
    const { organizationId } = c.get("ctx");
    const page = await getPublicPage({
      organizationId: organizationId as string,
      slug: c.req.valid("param").slug,
      requestedLocale: c.req.valid("query").locale,
    });
    c.header("Cache-Control", PUBLIC_CACHE_CONTROL);
    return c.json(page, 200);
  });

// The document describes only these routes (this router's registry), never the private ones.
publicRoutes.get("/openapi.json", allowPublic, (c) => {
  c.header("Cache-Control", PUBLIC_CACHE_CONTROL);
  return c.json(publicRoutes.getOpenAPI31Document(publicOpenApiConfig));
});
