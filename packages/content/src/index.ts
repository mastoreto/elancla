// @ancla/content — dominio de contenido compartido (el CMS custom como librería).
// Tipos + datos seed + acceso. el ancla (web) lee; iEkklesia (admin) escribirá.

// Re-exported so the web can check its own routes against it without depending on contracts.
export { RESERVED_ROOT_SLUGS } from "@ancla/contracts";
export * from "./access";
export * from "./blog";
export { type CachedLoaderOptions, createCachedLoader } from "./cachedLoader";
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
