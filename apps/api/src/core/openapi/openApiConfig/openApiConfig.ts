export const openApiConfig = {
  openapi: "3.1.0",
  info: { title: "El Ancla private API", version: "0.2.0" },
} as const;

/** The public contract is versioned on its own (`/public/v1`) and is what any site consumes. */
export const publicOpenApiConfig = {
  openapi: "3.1.0",
  info: {
    title: "El Ancla public API",
    version: "1.0.0",
    description:
      "Read-only content for church sites. Every request carries `Authorization: Bearer sk_<keyId>_<secret>` (a site key) and the church slug in the path.",
  },
} as const;
