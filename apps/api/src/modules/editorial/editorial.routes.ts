import {
  type EditorialContentTypeParam,
  editorialContentTypeParam,
  editorialInboxDto,
  editorialSettingsDto,
  editorialStatusDto,
  PERMISSIONS,
  requestChangesBody,
  revisionSummaryDto,
  saveDraftBody,
  updateEditorialSettingsBody,
} from "@ancla/contracts";
import { createRoute, z } from "@hono/zod-openapi";
import { allowAnySession, requireSession } from "../../core/auth";
import { requirePermission } from "../../core/authz";
import type { AuthenticatedContext } from "../../core/context";
import { createRouter } from "../../core/createApp";
import { getMailer } from "../../core/mail";
import {
  guardedResponses,
  jsonResponse,
  problemResponse,
} from "../../core/openapi";
import { requireEditorialPermission } from "./guards";
import { EDITORIAL_TYPES } from "./registry";
import {
  approve,
  getEditorialSettings,
  getEditorialStatus,
  getInbox,
  listHistory,
  pause,
  publish,
  requestChanges,
  saveDraft,
  submit,
  updateEditorialSettings,
} from "./useCases";
import type { EditorialInput } from "./useCases/editorialState";

const TAGS = ["editorial"];

const entityParams = z.object({
  type: editorialContentTypeParam,
  entityId: z.uuid(),
});
const settingsParams = z.object({ type: editorialContentTypeParam });

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

function inputOf(
  ctx: unknown,
  params: { type: EditorialContentTypeParam; entityId: string },
): EditorialInput {
  return {
    ctx: asAuthenticated(ctx),
    definition: EDITORIAL_TYPES[params.type],
    entityId: params.entityId,
  };
}

const entityGuard = (kind: "view" | "edit" | "publish") => [
  requireSession,
  requireEditorialPermission(kind),
];

const statusResponses = {
  200: jsonResponse(
    "The editorial status after the action",
    editorialStatusDto,
  ),
  404: problemResponse("Unknown content type"),
  409: problemResponse("The content is not in a state that allows this"),
  ...guardedResponses,
};

const statusRoute = createRoute({
  method: "get",
  path: "/editorial/{type}/{entityId}",
  tags: TAGS,
  summary:
    "Live and working revision of a content entity, with what the user can do next.",
  middleware: entityGuard("view"),
  request: { params: entityParams },
  responses: {
    200: statusResponses[200],
    404: statusResponses[404],
    ...guardedResponses,
  },
});

const historyRoute = createRoute({
  method: "get",
  path: "/editorial/{type}/{entityId}/history",
  tags: TAGS,
  summary: "Every revision of a content entity, newest first.",
  middleware: entityGuard("view"),
  request: { params: entityParams },
  responses: {
    200: jsonResponse("The revisions", z.array(revisionSummaryDto)),
    404: statusResponses[404],
    ...guardedResponses,
  },
});

const saveDraftRoute = createRoute({
  method: "put",
  path: "/editorial/{type}/{entityId}/draft",
  tags: TAGS,
  summary:
    "Save the draft of a content entity (starting one if there is none).",
  middleware: entityGuard("edit"),
  request: {
    params: entityParams,
    body: {
      content: { "application/json": { schema: saveDraftBody } },
      required: true,
    },
  },
  responses: {
    ...statusResponses,
    400: problemResponse("The request is not valid"),
  },
});

const actionRoute = (
  action: string,
  summary: string,
  kind: "view" | "edit" | "publish",
) =>
  createRoute({
    method: "post",
    path: `/editorial/{type}/{entityId}/${action}`,
    tags: TAGS,
    summary,
    middleware: entityGuard(kind),
    request: { params: entityParams },
    responses: statusResponses,
  });

const submitRoute = actionRoute("submit", "Send the draft to review.", "edit");
const publishRoute = actionRoute(
  "publish",
  "Publish the draft directly, or resume paused content.",
  "publish",
);
const pauseRoute = actionRoute(
  "pause",
  "Hide the published content without losing it.",
  "publish",
);
const approveRoute = actionRoute(
  "approve",
  "Approve the revision in review and publish it (configured reviewers only).",
  "view",
);
const requestChangesRoute = createRoute({
  method: "post",
  path: "/editorial/{type}/{entityId}/request-changes",
  tags: TAGS,
  summary: "Send the revision in review back to its author with a comment.",
  middleware: entityGuard("view"),
  request: {
    params: entityParams,
    body: {
      content: { "application/json": { schema: requestChangesBody } },
      required: true,
    },
  },
  responses: {
    ...statusResponses,
    400: problemResponse("The request is not valid"),
  },
});

const inboxRoute = createRoute({
  method: "get",
  path: "/editorial/inbox",
  tags: TAGS,
  summary:
    "What waits for the user: revisions to review and revisions that came back.",
  middleware: [allowAnySession],
  responses: {
    200: jsonResponse("The pending items", editorialInboxDto),
    401: problemResponse("No valid session"),
  },
});

const listSettingsRoute = createRoute({
  method: "get",
  path: "/editorial/settings",
  tags: TAGS,
  summary: "Who reviews, and who must be reviewed, for each content type.",
  middleware: [requireSession, requirePermission(PERMISSIONS.editorial.view)],
  responses: {
    200: jsonResponse(
      "One entry per content type",
      z.array(editorialSettingsDto),
    ),
    ...guardedResponses,
  },
});

const updateSettingsRoute = createRoute({
  method: "put",
  path: "/editorial/settings/{type}",
  tags: TAGS,
  summary: "Replace the review settings of a content type.",
  middleware: [requireSession, requirePermission(PERMISSIONS.editorial.edit)],
  request: {
    params: settingsParams,
    body: {
      content: { "application/json": { schema: updateEditorialSettingsBody } },
      required: true,
    },
  },
  responses: {
    200: jsonResponse("The saved settings", editorialSettingsDto),
    400: problemResponse(
      "The request is not valid, or an id is not from this organization",
    ),
    ...guardedResponses,
  },
});

export const editorialRoutes = createRouter()
  .openapi(inboxRoute, async (c) =>
    c.json(await getInbox(asAuthenticated(c.get("ctx"))), 200),
  )
  .openapi(listSettingsRoute, async (c) =>
    c.json(
      await getEditorialSettings(asAuthenticated(c.get("ctx")).organizationId),
      200,
    ),
  )
  .openapi(updateSettingsRoute, async (c) => {
    const ctx = asAuthenticated(c.get("ctx"));
    const { type } = c.req.valid("param");
    const saved = await updateEditorialSettings({
      ctx,
      definition: EDITORIAL_TYPES[type],
      body: c.req.valid("json"),
    });
    return c.json(saved, 200);
  })
  .openapi(statusRoute, async (c) =>
    c.json(
      await getEditorialStatus(inputOf(c.get("ctx"), c.req.valid("param"))),
      200,
    ),
  )
  .openapi(historyRoute, async (c) =>
    c.json(await listHistory(inputOf(c.get("ctx"), c.req.valid("param"))), 200),
  )
  .openapi(saveDraftRoute, async (c) => {
    const input = inputOf(c.get("ctx"), c.req.valid("param"));
    return c.json(
      await saveDraft({ ...input, body: c.req.valid("json") }),
      200,
    );
  })
  .openapi(submitRoute, async (c) => {
    const input = inputOf(c.get("ctx"), c.req.valid("param"));
    return c.json(await submit({ ...input, mailer: getMailer() }), 200);
  })
  .openapi(publishRoute, async (c) =>
    c.json(await publish(inputOf(c.get("ctx"), c.req.valid("param"))), 200),
  )
  .openapi(pauseRoute, async (c) =>
    c.json(await pause(inputOf(c.get("ctx"), c.req.valid("param"))), 200),
  )
  .openapi(approveRoute, async (c) => {
    const input = inputOf(c.get("ctx"), c.req.valid("param"));
    return c.json(await approve({ ...input, mailer: getMailer() }), 200);
  })
  .openapi(requestChangesRoute, async (c) => {
    const input = inputOf(c.get("ctx"), c.req.valid("param"));
    const body = c.req.valid("json" as never) as z.infer<
      typeof requestChangesBody
    >;
    return c.json(
      await requestChanges({ ...input, body, mailer: getMailer() }),
      200,
    );
  });
