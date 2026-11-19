import {
  acceptInvitationBody,
  createInvitationBody,
  invitationDto,
  invitationPreviewDto,
  type Permission,
  pageQuerySchema,
  pageSchema,
} from "@ancla/contracts";
import { createRoute, z } from "@hono/zod-openapi";
import { requireSession } from "../../../core/auth";
import { allowPublic, requirePermission } from "../../../core/authz";
import type { AuthenticatedContext } from "../../../core/context";
import { createRouter } from "../../../core/createApp";
import { rateLimit } from "../../../core/http";
import { getMailer } from "../../../core/mail";
import {
  guardedResponses,
  jsonResponse,
  problemResponse,
} from "../../../core/openapi";
import { toInvitationDto } from "./mappers";
import {
  acceptInvitation,
  createInvitation,
  listInvitations,
  previewInvitation,
  resendInvitation,
  revokeInvitation,
} from "./useCases";

const can = (permission: Permission) => [
  requireSession,
  requirePermission(permission),
];
const PREVIEW_LIMIT = {
  name: "invitation-preview",
  max: 30,
  windowSeconds: 60,
};
const ACCEPT_LIMIT = { name: "invitation-accept", max: 10, windowSeconds: 60 };

const idParams = z.object({ id: z.uuid() });
const tokenParams = z.object({ token: z.string().min(20).max(100) });

const createInvitationRoute = createRoute({
  method: "post",
  path: "/invitations",
  tags: ["invitations"],
  summary: "Invite a person by email.",
  middleware: can("invitations:create"),
  request: {
    body: {
      content: { "application/json": { schema: createInvitationBody } },
      required: true,
    },
  },
  responses: {
    201: jsonResponse("Invitation created and emailed", invitationDto),
    400: problemResponse("The request is not valid"),
    409: problemResponse(
      "The email already has an account or a pending invitation",
    ),
    ...guardedResponses,
  },
});

const listRoute = createRoute({
  method: "get",
  path: "/invitations",
  tags: ["invitations"],
  summary: "List invitations.",
  middleware: can("invitations:view"),
  request: { query: pageQuerySchema },
  responses: {
    200: jsonResponse("A page of invitations", pageSchema(invitationDto)),
    ...guardedResponses,
  },
});

const revokeRoute = createRoute({
  method: "post",
  path: "/invitations/{id}/revoke",
  tags: ["invitations"],
  summary: "Revoke an invitation.",
  middleware: can("invitations:delete"),
  request: { params: idParams },
  responses: {
    200: jsonResponse("Invitation revoked", invitationDto),
    404: problemResponse("Not found"),
    409: problemResponse("Already accepted"),
    ...guardedResponses,
  },
});

const resendRoute = createRoute({
  method: "post",
  path: "/invitations/{id}/resend",
  tags: ["invitations"],
  summary: "Send the invitation again with a new link.",
  middleware: can("invitations:create"),
  request: { params: idParams },
  responses: {
    200: jsonResponse("Invitation re-sent", invitationDto),
    404: problemResponse("Not found"),
    409: problemResponse("Accepted or revoked"),
    ...guardedResponses,
  },
});

const previewRoute = createRoute({
  method: "get",
  path: "/invitations/by-token/{token}",
  tags: ["invitations"],
  summary: "Public: what an invitation link is for.",
  middleware: [allowPublic, rateLimit(PREVIEW_LIMIT)],
  request: { params: tokenParams },
  responses: {
    200: jsonResponse(
      "Masked email, organization and validity",
      invitationPreviewDto,
    ),
    404: problemResponse("The link is not valid"),
    429: problemResponse("Too many requests"),
  },
});

const acceptRoute = createRoute({
  method: "post",
  path: "/invitations/by-token/{token}/accept",
  tags: ["invitations"],
  summary: "Public: create the account with a password.",
  middleware: [allowPublic, rateLimit(ACCEPT_LIMIT)],
  request: {
    params: tokenParams,
    body: {
      content: { "application/json": { schema: acceptInvitationBody } },
      required: true,
    },
  },
  responses: {
    204: { description: "Account created" },
    404: problemResponse("The link is not valid"),
    429: problemResponse("Too many requests"),
  },
});

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

export const invitationsRoutes = createRouter()
  .openapi(createInvitationRoute, async (c) => {
    const invitation = await createInvitation({
      ctx: asAuthenticated(c.get("ctx")),
      body: c.req.valid("json"),
      mailer: getMailer(),
    });
    return c.json(toInvitationDto(invitation, new Date()), 201);
  })
  .openapi(listRoute, async (c) =>
    c.json(
      await listInvitations(
        asAuthenticated(c.get("ctx")),
        c.req.valid("query"),
      ),
      200,
    ),
  )
  .openapi(revokeRoute, async (c) =>
    c.json(
      await revokeInvitation(
        asAuthenticated(c.get("ctx")),
        c.req.valid("param").id,
      ),
      200,
    ),
  )
  .openapi(resendRoute, async (c) =>
    c.json(
      await resendInvitation({
        ctx: asAuthenticated(c.get("ctx")),
        id: c.req.valid("param").id,
        mailer: getMailer(),
      }),
      200,
    ),
  )
  .openapi(previewRoute, async (c) =>
    c.json(await previewInvitation(c.req.valid("param").token), 200),
  )
  .openapi(acceptRoute, async (c) => {
    await acceptInvitation({
      token: c.req.valid("param").token,
      body: c.req.valid("json"),
    });
    return c.body(null, 204);
  });
