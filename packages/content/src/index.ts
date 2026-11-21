// @ancla/content — dominio de contenido compartido (el CMS custom como librería).
// Cliente de la API pública + renderers. el ancla (web) lee; iEkklesia (admin) escribe.

// Re-exported so the web can check its own routes against it without depending on contracts.
export { RESERVED_ROOT_SLUGS } from "@ancla/contracts";
export {
  type BlogIndexLoader,
  type BlogLoaderOptions,
  createBlogIndexLoader,
  createPostLoader,
  createPostViewRecorder,
  getBlogIndex,
  getPost,
  type PostLoader,
  type PostViewRecorder,
  type PublicBlogCover,
  type PublicBlogIndex,
  type PublicPost,
  type PublicPostAuthor,
  type PublicPostSummary,
  type PublicSeries,
  recordPostView,
} from "./blog";
export { type CachedLoaderOptions, createCachedLoader } from "./cachedLoader";
export {
  createMinistriesLoader,
  createMinistryLoader,
  getMinistries,
  getMinistry,
  type MinistriesLoader,
  type MinistriesLoaderOptions,
  type MinistryLoader,
  type PublicLandingEntry,
  type PublicMinistries,
  type PublicMinistry,
  type PublicMinistryLeader,
  type PublicMinistrySummary,
} from "./ministries";
export {
  createPageLoader,
  createPagesLoader,
  getPage,
  getPages,
  type PageLoader,
  type PagesLoader,
  type PagesLoaderOptions,
  type PublicPage,
  type PublicPageSummary,
} from "./pages";
export {
  createPeopleLoader,
  getPeople,
  type PeopleLoader,
  type PeopleLoaderOptions,
  type PublicPerson,
} from "./people";
export {
  createPublicClient,
  PublicApiError,
  type PublicClient,
} from "./publicClient";
export { renderBlogBody, renderRichText } from "./richText";
export * from "./site";
export {
  createVisitLoader,
  getVisit,
  type VisitContent,
  type VisitLoader,
  type VisitLoaderOptions,
} from "./visit";
