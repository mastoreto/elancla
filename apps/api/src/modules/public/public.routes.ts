import {
  publicBlogIndexDto,
  publicBlogQuery,
  publicLocaleQuery,
  publicPageDto,
  publicPageListDto,
  publicPageQuery,
  publicPeopleQuery,
  publicPersonDto,
  publicPostDto,
  publicSiteSettingsDto,
  publicVisitDto,
  recordPostViewBody,
} from "@ancla/contracts";
import { createRoute, z } from "@hono/zod-openapi";
import { allowPublic } from "../../core/authz";
import { createRouter } from "../../core/createApp";
import { rateLimit } from "../../core/http";
import {
  jsonResponse,
  problemResponse,
  publicOpenApiConfig,
} from "../../core/openapi";
import { requireSiteKey } from "./guards";
import {
  getPublicBlogIndex,
  getPublicPage,
  getPublicPages,
  getPublicPeople,
  getPublicPost,
  getPublicSiteSettings,
  getPublicVisit,
  recordPublicPostView,
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

const postsRoute = createRoute({
  method: "get",
  path: "/{churchSlug}/posts",
  tags: ["blog"],
  summary:
    "The blog index: visible posts, featured, categories, series, archive, most read and tags.",
  middleware: [requireSiteKey],
  request: { params: churchParams, query: publicBlogQuery },
  responses: {
    200: jsonResponse("The blog index", publicBlogIndexDto),
    400: problemResponse("The locale is not valid"),
    401: problemResponse(
      "The site key is missing, invalid or not for this church",
    ),
    404: problemResponse("The church was not found"),
  },
});

const postRoute = createRoute({
  method: "get",
  path: "/{churchSlug}/posts/{slug}",
  tags: ["blog"],
  summary:
    "A visible post by its slug (in any of its languages), in the requested language.",
  middleware: [requireSiteKey],
  request: {
    params: churchParams.extend({ slug: z.string() }),
    query: publicBlogQuery,
  },
  responses: {
    200: jsonResponse("The post", publicPostDto),
    400: problemResponse("The locale is not valid"),
    401: problemResponse(
      "The site key is missing, invalid or not for this church",
    ),
    404: problemResponse("There is no visible post with that slug"),
  },
});

/** One bucket per forwarded visitor address; the web forwards the visitor's, not its own. */
const POST_VIEWS_RATE_LIMIT = {
  name: "post-views",
  max: 30,
  windowSeconds: 60,
};

const postViewRoute = createRoute({
  method: "post",
  path: "/{churchSlug}/posts/{slug}/views",
  tags: ["blog"],
  summary:
    "Counts an anonymous view of a post. Always 204: it does not say whether it counted.",
  middleware: [requireSiteKey, rateLimit(POST_VIEWS_RATE_LIMIT)],
  request: {
    params: churchParams.extend({ slug: z.string() }),
    body: {
      required: true,
      content: { "application/json": { schema: recordPostViewBody } },
    },
  },
  responses: {
    204: { description: "Received (counted or not)" },
    400: problemResponse("The body is not valid"),
    401: problemResponse(
      "The site key is missing, invalid or not for this church",
    ),
    429: problemResponse("Too many requests from that address"),
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
  })
  .openapi(postsRoute, async (c) => {
    const { organizationId } = c.get("ctx");
    const index = await getPublicBlogIndex({
      organizationId: organizationId as string,
      requestedLocale: c.req.valid("query").locale,
    });
    c.header("Cache-Control", PUBLIC_CACHE_CONTROL);
    return c.json(index, 200);
  })
  .openapi(postRoute, async (c) => {
    const { organizationId } = c.get("ctx");
    const post = await getPublicPost({
      organizationId: organizationId as string,
      slug: c.req.valid("param").slug,
      requestedLocale: c.req.valid("query").locale,
    });
    c.header("Cache-Control", PUBLIC_CACHE_CONTROL);
    return c.json(post, 200);
  })
  .openapi(postViewRoute, async (c) => {
    const { organizationId } = c.get("ctx");
    await recordPublicPostView({
      organizationId: organizationId as string,
      slug: c.req.valid("param").slug,
      visitor: c.req.valid("json"),
    });
    return c.body(null, 204);
  });

// The document describes only these routes (this router's registry), never the private ones.
publicRoutes.get("/openapi.json", allowPublic, (c) => {
  c.header("Cache-Control", PUBLIC_CACHE_CONTROL);
  return c.json(publicRoutes.getOpenAPI31Document(publicOpenApiConfig));
});
