import { createAuthRouter } from "./core/auth";
import { createApp, createRouter } from "./core/createApp";
import { openApiConfig } from "./core/openapi";
import { auditRoutes } from "./modules/audit";
import { healthRoutes } from "./modules/health";
import { invitationsRoutes } from "./modules/identity/invitations";
import { rolesRoutes } from "./modules/identity/roles";
import { usersRoutes } from "./modules/identity/users";
import { meRoutes } from "./modules/me";
import { mediaInternalRoutes, mediaRoutes } from "./modules/media";
import { ministriesRoutes } from "./modules/ministries";

/** Module routes without the `/api` prefix: this is what the typed client mirrors. */
const routes = createRouter()
  .route("/", healthRoutes)
  .route("/", meRoutes)
  .route("/", invitationsRoutes)
  .route("/", rolesRoutes)
  .route("/", usersRoutes)
  .route("/", ministriesRoutes)
  .route("/", auditRoutes)
  .route("/", mediaRoutes)
  .route("/", mediaInternalRoutes);

// Better Auth is mounted next to the typed routes but kept out of `AppType`: it has its own client.
export const app = createApp()
  .route("/", routes)
  .route("/", createAuthRouter());

// ponytail: the private contract is never published; the endpoint only exists outside production.
if (process.env.NODE_ENV !== "production") {
  app.doc31("/openapi.json", openApiConfig);
}

export type AppType = typeof routes;
