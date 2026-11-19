import {
  acceptInvitationBody,
  createInvitationBody,
  invitationDto,
  invitationPreviewDto,
  pageQuerySchema,
  pageSchema,
  problemSchema,
} from "@ancla/contracts";
import { createRoute, z } from "@hono/zod-openapi";
import { requireAdmin, requireSession } from "../../../core/auth";
import type { AuthenticatedContext } from "../../../core/context";
import { createRouter } from "../../../core/createApp";
import { rateLimit } from "../../../core/http";
import { getMailer } from "../../../core/mail";
import { toInvitationDto } from "./mappers";
import {
  acceptInvitation,
  createInvitation,
  listInvitations,
  previewInvitation,
  resendInvitation,
  revokeInvitation,
} from "./useCases";

const ADMIN_ONLY = [requireSession, requireAdmin];
const PREVIEW_LIMIT = {
  name: "invitation-preview",
  max: 30,
  windowSeconds: 60,
};
const ACCEPT_LIMIT = { name: "invitation-accept", max: 10, windowSeconds: 60 };

const problem = (description: string) => ({
  description,
  content: { "application/problem+json": { schema: problemSchema } },
});
const json = <Schema extends z.ZodType>(
  description: string,
  schema: Schema,
) => ({
  description,
  content: { "application/json": { schema } },
});

const idParams = z.object({ id: z.uuid() });
const tokenParams = z.object({ token: z.string().min(20).max(100) });
const adminErrors = {
  401: problem("No valid session"),
  403: problem("Admin only"),
};

const createInvitationRoute = createRoute({
  method: "post",
  path: "/invitations",
  tags: ["invitations"],
  summary: "Invite a person by email.",
  middleware: ADMIN_ONLY,
  request: {
    body: {
      content: { "application/json": { schema: createInvitationBody } },
      required: true,
    },
  },
  responses: {
    201: json("Invitation created and emailed", invitationDto),
    400: problem("The request is not valid"),
    409: problem("The email already has an account or a pending invitation"),
    ...adminErrors,
  },
});

const listRoute = createRoute({
  method: "get",
  path: "/invitations",
  tags: ["invitations"],
  summary: "List invitations.",
  middleware: ADMIN_ONLY,
  request: { query: pageQuerySchema },
  responses: {
    200: json("A page of invitations", pageSchema(invitationDto)),
    ...adminErrors,
  },
});

const revokeRoute = createRoute({
  method: "post",
  path: "/invitations/{id}/revoke",
  tags: ["invitations"],
  summary: "Revoke an invitation.",
  middleware: ADMIN_ONLY,
  request: { params: idParams },
  responses: {
    200: json("Invitation revoked", invitationDto),
    404: problem("Not found"),
    409: problem("Already accepted"),
    ...adminErrors,
  },
});

const resendRoute = createRoute({
  method: "post",
  path: "/invitations/{id}/resend",
  tags: ["invitations"],
  summary: "Send the invitation again with a new link.",
  middleware: ADMIN_ONLY,
  request: { params: idParams },
  responses: {
    200: json("Invitation re-sent", invitationDto),
    404: problem("Not found"),
    409: problem("Accepted or revoked"),
    ...adminErrors,
  },
});

const previewRoute = createRoute({
  method: "get",
  path: "/invitations/by-token/{token}",
  tags: ["invitations"],
  summary: "Public: what an invitation link is for.",
  middleware: [rateLimit(PREVIEW_LIMIT)],
  request: { params: tokenParams },
  responses: {
    200: json("Masked email, organization and validity", invitationPreviewDto),
    404: problem("The link is not valid"),
    429: problem("Too many requests"),
  },
});

const acceptRoute = createRoute({
  method: "post",
  path: "/invitations/by-token/{token}/accept",
  tags: ["invitations"],
  summary: "Public: create the account with a password.",
  middleware: [rateLimit(ACCEPT_LIMIT)],
  request: {
    params: tokenParams,
    body: {
      content: { "application/json": { schema: acceptInvitationBody } },
      required: true,
    },
  },
  responses: {
    204: { description: "Account created" },
    404: problem("The link is not valid"),
    429: problem("Too many requests"),
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
