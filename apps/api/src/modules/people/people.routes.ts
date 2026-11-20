import {
  PERMISSIONS,
  type Permission,
  personProfileDto,
  personProfileListDto,
  upsertPersonProfileBody,
} from "@ancla/contracts";
import { createRoute, z } from "@hono/zod-openapi";
import { requireSession } from "../../core/auth";
import { requirePermission } from "../../core/authz";
import type { AuthenticatedContext } from "../../core/context";
import { createRouter } from "../../core/createApp";
import {
  guardedResponses,
  jsonResponse,
  problemResponse,
} from "../../core/openapi";
import {
  createPerson,
  deletePerson,
  getPerson,
  listPeople,
  updatePerson,
} from "./useCases";

const TAGS = ["people"];

const can = (permission: Permission) => [
  requireSession,
  requirePermission(permission),
];

const asAuthenticated = (ctx: unknown): AuthenticatedContext =>
  ctx as AuthenticatedContext;

const idParams = z.object({ id: z.uuid() });

const jsonBody = {
  content: { "application/json": { schema: upsertPersonProfileBody } },
  required: true,
} as const;

// Literal paths, one route per verb: the typed client infers `content.people.$get` and friends.
const listRoute = createRoute({
  method: "get",
  path: "/content/people",
  tags: TAGS,
  summary: "List the people profiles, by name.",
  middleware: can(PERMISSIONS.people.view),
  responses: {
    200: jsonResponse("The people", personProfileListDto),
    ...guardedResponses,
  },
});

const createPersonRoute = createRoute({
  method: "post",
  path: "/content/people",
  tags: TAGS,
  summary: "Create a person profile with its roles.",
  middleware: can(PERMISSIONS.people.create),
  request: { body: jsonBody },
  responses: {
    201: jsonResponse("The person created", personProfileDto),
    400: problemResponse(
      "The request is not valid, or the photo, user or a language is not allowed",
    ),
    409: problemResponse("The user already has a profile"),
    ...guardedResponses,
  },
});

const getRoute = createRoute({
  method: "get",
  path: "/content/people/{id}",
  tags: TAGS,
  summary: "One person profile as the CRM edits it.",
  middleware: can(PERMISSIONS.people.view),
  request: { params: idParams },
  responses: {
    200: jsonResponse("The person", personProfileDto),
    404: problemResponse("The person was not found"),
    ...guardedResponses,
  },
});

const patchRoute = createRoute({
  method: "patch",
  path: "/content/people/{id}",
  tags: TAGS,
  summary:
    "Replace a profile: its fields, the bios sent and the whole list of roles.",
  middleware: can(PERMISSIONS.people.edit),
  request: { params: idParams, body: jsonBody },
  responses: {
    200: jsonResponse("The person after the change", personProfileDto),
    400: problemResponse(
      "The request is not valid, or the photo, user or a language is not allowed",
    ),
    404: problemResponse("The person was not found"),
    409: problemResponse("The user already has a profile"),
    ...guardedResponses,
  },
});

const deleteRoute = createRoute({
  method: "delete",
  path: "/content/people/{id}",
  tags: TAGS,
  summary: "Delete a person profile and its roles.",
  middleware: can(PERMISSIONS.people.delete),
  request: { params: idParams },
  responses: {
    204: { description: "Person deleted" },
    404: problemResponse("The person was not found"),
    ...guardedResponses,
  },
});

export const peopleRoutes = createRouter()
  .openapi(listRoute, async (c) =>
    c.json(await listPeople(asAuthenticated(c.get("ctx")).organizationId), 200),
  )
  .openapi(createPersonRoute, async (c) =>
    c.json(
      await createPerson(asAuthenticated(c.get("ctx")), c.req.valid("json")),
      201,
    ),
  )
  .openapi(getRoute, async (c) =>
    c.json(
      await getPerson(
        asAuthenticated(c.get("ctx")).organizationId,
        c.req.valid("param").id,
      ),
      200,
    ),
  )
  .openapi(patchRoute, async (c) =>
    c.json(
      await updatePerson(
        asAuthenticated(c.get("ctx")),
        c.req.valid("param").id,
        c.req.valid("json"),
      ),
      200,
    ),
  )
  .openapi(deleteRoute, async (c) => {
    await deletePerson(asAuthenticated(c.get("ctx")), c.req.valid("param").id);
    return c.body(null, 204);
  });
