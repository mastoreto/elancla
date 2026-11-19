import type { Context, ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AppEnv } from "../../context";
import { DomainError } from "../DomainError";
import { NotFoundError } from "../NotFoundError";
import { toProblem } from "../toProblem";

const PROBLEM_CONTENT_TYPE = "application/problem+json";

function problemResponse(c: Context<AppEnv>, error: unknown): Response {
  const problem = toProblem(error, c.get("requestId"));
  return c.newResponse(JSON.stringify(problem), problem.status as 400, {
    "Content-Type": PROBLEM_CONTENT_TYPE,
  });
}

function isExpected(error: unknown): boolean {
  return error instanceof DomainError || error instanceof HTTPException;
}

export const errorHandler: ErrorHandler<AppEnv> = (error, c) => {
  if (!isExpected(error)) {
    // Detail stays server-side; the client only gets the requestId to quote.
    console.error(
      JSON.stringify({
        level: "error",
        requestId: c.get("requestId"),
        name: error instanceof Error ? error.name : "UnknownError",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }),
    );
  }
  return problemResponse(c, error);
};

export const notFoundHandler: NotFoundHandler<AppEnv> = (c) =>
  problemResponse(c, new NotFoundError("Route not found"));
