import { problemSchema } from "@ancla/contracts";
import type { z } from "@hono/zod-openapi";

/** A Problem Details response entry for `createRoute`. */
export const problemResponse = (description: string) => ({
  description,
  content: { "application/problem+json": { schema: problemSchema } },
});

/** A JSON response entry for `createRoute`. */
export const jsonResponse = <Schema extends z.ZodType>(
  description: string,
  schema: Schema,
) => ({
  description,
  content: { "application/json": { schema } },
});

/** Responses every guarded route can return. */
export const guardedResponses = {
  401: problemResponse("No valid session"),
  403: problemResponse("The role does not allow this"),
};
