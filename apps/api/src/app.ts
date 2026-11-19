import { createApp, createRouter } from "./core/createApp";
import { openApiConfig } from "./core/openapi";
import { healthRoutes } from "./modules/health";
import { meRoutes } from "./modules/me";

/** Module routes without the `/api` prefix: this is what the typed client mirrors. */
const routes = createRouter().route("/", healthRoutes).route("/", meRoutes);

export const app = createApp().route("/", routes);

// ponytail: the private contract is never published; the endpoint only exists outside production.
if (process.env.NODE_ENV !== "production") {
  app.doc31("/openapi.json", openApiConfig);
}

export type AppType = typeof routes;
