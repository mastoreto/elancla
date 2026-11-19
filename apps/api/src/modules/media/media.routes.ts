import {
  createUploadBody,
  downloadLinkDto,
  mediaFileDto,
  uploadTicketDto,
} from "@ancla/contracts";
import { createRoute, z } from "@hono/zod-openapi";
import { requireSession } from "../../core/auth";
import type { AuthenticatedContext } from "../../core/context";
import { createRouter } from "../../core/createApp";
import {
  guardedResponses,
  jsonResponse,
  problemResponse,
} from "../../core/openapi";
import { finalizeUpload, issueDownload, requestUpload } from "./useCases";

const idParams = z.object({ id: z.uuid() });
const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

// The permission is the one of the file's purpose, so it is resolved inside the use case; the
// route only requires a session (which is also its access declaration).
const requestUploadRoute = createRoute({
  method: "post",
  path: "/media/uploads",
  tags: ["media"],
  summary:
    "Declare a file and get a presigned PUT into quarantine. The permission is the purpose's.",
  middleware: [requireSession],
  request: {
    body: {
      content: { "application/json": { schema: createUploadBody } },
      required: true,
    },
  },
  responses: {
    201: jsonResponse("Where and how to upload the bytes", uploadTicketDto),
    400: problemResponse("Type or size not allowed for the purpose"),
    ...guardedResponses,
  },
});

const finalizeRoute = createRoute({
  method: "post",
  path: "/media/uploads/{id}/finalize",
  tags: ["media"],
  summary:
    "Verify the uploaded bytes (size, real type, checksum) and publish the variants. Uploader only.",
  middleware: [requireSession],
  request: { params: idParams },
  responses: {
    200: jsonResponse("The verified file", mediaFileDto),
    404: problemResponse("Not found, or uploaded by someone else"),
    409: problemResponse("Already finalized"),
    422: problemResponse(
      "The bytes are not what was declared; the file was deleted",
    ),
    ...guardedResponses,
  },
});

const downloadRoute = createRoute({
  method: "get",
  path: "/media/{id}/download",
  tags: ["media"],
  summary:
    "A 60-second download link for a private file. Every issue is audited.",
  middleware: [requireSession],
  request: { params: idParams },
  responses: {
    200: jsonResponse("The short-lived link", downloadLinkDto),
    404: problemResponse("Not found"),
    409: problemResponse("Public or not ready"),
    ...guardedResponses,
  },
});

export const mediaRoutes = createRouter()
  .openapi(requestUploadRoute, async (c) =>
    c.json(
      await requestUpload({
        ctx: asAuthenticated(c.get("ctx")),
        body: c.req.valid("json"),
      }),
      201,
    ),
  )
  .openapi(finalizeRoute, async (c) =>
    c.json(
      await finalizeUpload(
        asAuthenticated(c.get("ctx")),
        c.req.valid("param").id,
      ),
      200,
    ),
  )
  .openapi(downloadRoute, async (c) =>
    c.json(
      await issueDownload(
        asAuthenticated(c.get("ctx")),
        c.req.valid("param").id,
      ),
      200,
    ),
  );
