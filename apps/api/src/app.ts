import { createAuthRouter } from "./core/auth";
import { createApp, createRouter } from "./core/createApp";
import { openApiConfig } from "./core/openapi";
import { auditRoutes } from "./modules/audit";
import { blogInternalRoutes, blogRoutes } from "./modules/blog";
import { editorialRoutes } from "./modules/editorial";
import { healthRoutes } from "./modules/health";
import { invitationsRoutes } from "./modules/identity/invitations";
import { rolesRoutes } from "./modules/identity/roles";
import { usersRoutes } from "./modules/identity/users";
import { meRoutes } from "./modules/me";
import { mediaInternalRoutes, mediaRoutes } from "./modules/media";
import {
  ministriesRoutes,
  ministryCategoriesRoutes,
  ministryContentRoutes,
} from "./modules/ministries";
import { pagesRoutes } from "./modules/pages";
import { peopleRoutes } from "./modules/people";
import { publicRoutes } from "./modules/public";
import { siteRoutes } from "./modules/site";
import { siteKeysRoutes } from "./modules/siteKeys";
import { visitRoutes } from "./modules/visit";

/**
 * Module routes without the `/api` prefix: this is what the typed client mirrors. The public API
 * is mounted next to them but kept out of `AppType`: it has its own contract (`public-v1.json`),
 * and the CRM never calls it. With it inside, `hc<AppType>` hits TypeScript's instantiation depth
 * limit ("excessively deep") once the private routes grew past the ministries.
 */
const routes = createRouter()
  .route("/", healthRoutes)
  .route("/", meRoutes)
  .route("/", invitationsRoutes)
  .route("/", rolesRoutes)
  .route("/", usersRoutes)
  .route("/", ministriesRoutes)
  .route("/", ministryContentRoutes)
  .route("/", ministryCategoriesRoutes)
  .route("/", auditRoutes)
  .route("/", mediaRoutes)
  .route("/", mediaInternalRoutes)
  .route("/", blogInternalRoutes)
  .route("/", siteKeysRoutes)
  .route("/", siteRoutes)
  .route("/", peopleRoutes)
  .route("/", visitRoutes)
  .route("/", pagesRoutes)
  .route("/", blogRoutes)
  .route("/", editorialRoutes);

// Better Auth is mounted next to the typed routes but kept out of `AppType`: it has its own client.
export const app = createApp()
  .route("/", routes)
  .route("/public/v1", publicRoutes)
  .route("/", createAuthRouter());

// ponytail: the private contract is never published; the endpoint only exists outside production.
if (process.env.NODE_ENV !== "production") {
  app.doc31("/openapi.json", openApiConfig);
}

export type AppType = typeof routes;
