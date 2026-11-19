import { OpenAPIHono } from "@hono/zod-openapi";
import type { BlankSchema } from "hono/types";
import { type AppEnv, contextMiddleware } from "../context";
import { errorHandler, notFoundHandler, ValidationError } from "../errors";
import {
  bodyLimit,
  csrf,
  jsonOnly,
  requestId,
  requestLogger,
  securityHeaders,
} from "../http";

export const API_BASE_PATH = "/api";

/** Turns a failed request validation (zod-openapi) into a 400 Problem Details. */
const validationHook = (result: {
  success: boolean;
  error?: { issues: { path: PropertyKey[]; message: string }[] };
}): void => {
  if (result.success || !result.error) return;
  throw new ValidationError(
    "The request is not valid",
    result.error.issues.map((issue) => ({
      path: issue.path.map(String).join("."),
      message: issue.message,
    })),
  );
};

/** Router for a module: same validation behavior as the root app, no middlewares of its own. */
export function createRouter(): OpenAPIHono<AppEnv> {
  return new OpenAPIHono<AppEnv>({ defaultHook: validationHook });
}

/**
 * Root app: `/api` base path and the transversal middleware chain, in order. Modules are mounted
 * on it by `app.ts`.
 */
export function createApp(): OpenAPIHono<
  AppEnv,
  BlankSchema,
  typeof API_BASE_PATH
> {
  const app = createRouter().basePath(API_BASE_PATH);
  app.use("*", requestId);
  app.use("*", contextMiddleware);
  app.use("*", securityHeaders);
  app.use("*", requestLogger);
  app.use("*", csrf);
  app.use("*", jsonOnly);
  app.use("*", bodyLimit);
  app.onError(errorHandler);
  app.notFound(notFoundHandler);
  return app;
}
