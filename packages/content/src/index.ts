// @ancla/content — dominio de contenido compartido (el CMS custom como librería).
// Tipos + datos seed + acceso. el ancla (web) lee; iEkklesia (admin) escribirá.

export * from "./access";
export * from "./blog";
export { type CachedLoaderOptions, createCachedLoader } from "./cachedLoader";
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
export * from "./site";
