import type { Problem } from "@ancla/contracts";
import { HTTPException } from "hono/http-exception";
import { DomainError } from "../DomainError";
import { ValidationError } from "../ValidationError";

const PROBLEM_TYPE_PREFIX = "urn:ancla:problem:";

/** Statuses produced by Hono's own middlewares (csrf, body limit, malformed JSON...). */
const HTTP_STATUS_PROBLEMS: Record<number, { code: string; title: string }> = {
  400: { code: "bad_request", title: "Bad Request" },
  403: { code: "forbidden", title: "Forbidden" },
  404: { code: "not_found", title: "Not Found" },
  413: { code: "payload_too_large", title: "Payload Too Large" },
  415: { code: "unsupported_media_type", title: "Unsupported Media Type" },
};

const TITLES: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
};

function problem(
  status: number,
  code: string,
  title: string,
  requestId: string,
): Problem {
  return {
    type: `${PROBLEM_TYPE_PREFIX}${code}`,
    title,
    status,
    code,
    requestId,
  };
}

/**
 * Maps any thrown value to a Problem Details body. Only domain errors and known HTTP statuses
 * carry a message; everything else becomes a generic 500 (the detail goes to the logs).
 */
export function toProblem(error: unknown, requestId: string): Problem {
  if (error instanceof DomainError) {
    const base = problem(
      error.status,
      error.code,
      TITLES[error.status] ?? "Error",
      requestId,
    );
    const withDetail = { ...base, detail: error.message };
    if (error instanceof ValidationError && error.issues.length > 0) {
      return { ...withDetail, errors: error.issues };
    }
    return withDetail;
  }
  if (error instanceof HTTPException) {
    const known = HTTP_STATUS_PROBLEMS[error.status];
    if (known) return problem(error.status, known.code, known.title, requestId);
  }
  return problem(500, "internal_error", "Internal Server Error", requestId);
}
