import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { grant, PERMISSIONS } from "@ancla/contracts";
import { db } from "@ancla/db";
import { createApiCaller } from "../../../../test/support/apiCaller";
import {
  defineAuthzMatrix,
  type MatrixRow,
} from "../../../../test/support/authzMatrix";
import { createFixtures } from "../../../../test/support/fixtures";
import { app } from "../../../app";
import { getAuth } from "../../auth";
import { resolveOrganizationId } from "../../tenancy";
import { findUnguardedRoutes } from "../routeCoverage";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);
const UNKNOWN_ID = "01900000-0000-7000-8000-000000000000";

// A real post: its editorial routes answer from the entity (a missing one is a 404).
let blogPostId = UNKNOWN_ID;
const blogPostPath =
  (suffix = "") =>
  (): string =>
    `/editorial/blog-post/${blogPostId}${suffix}`;

beforeAll(async () => {
  const organizationId = await resolveOrganizationId();
  blogPostId = (await db.post.create({ data: { organizationId } })).id;
});

afterAll(async () => {
  await db.post.deleteMany({ where: { id: blogPostId } });
  await fixtures.cleanup();
});

const NOTHING = [] as const;
const validRole = { name: "x", grants: [] };
const imageUpload = {
  purpose: "contentImage",
  contentType: "image/png",
  size: 10,
  fileName: "a.png",
};
const voucherUpload = {
  purpose: "voucherDocument",
  contentType: "application/pdf",
  size: 10,
  fileName: "a.pdf",
};

const EDITORIAL_BODIES: Record<string, unknown> = {
  draft: { snapshot: {} },
  "request-changes": { comment: "x" },
  "blog-post": {
    reviewerRoleIds: [],
    reviewerUserIds: [],
    mandatoryReviewRoleIds: [],
    mandatoryReviewUserIds: [],
  },
};

/** Each row proves the guard: 401/403 when stopped, anything else (200/400/404) when let through. */
const rows: MatrixRow[] = [
  // Any session reaches /me; no session does not.
  {
    who: "anonymous",
    caller: "anonymous",
    method: "GET",
    path: "/me",
    expected: 401,
  },
  {
    who: "anonymous",
    caller: "anonymous",
    method: "POST",
    path: "/me/password",
    body: {},
    expected: 401,
  },
  {
    who: "no role",
    caller: NOTHING,
    method: "POST",
    path: `/invitations/${UNKNOWN_ID}/resend`,
    expected: 403,
  },
  {
    who: PERMISSIONS.users.view,
    caller: [grant(PERMISSIONS.users.view)],
    method: "PUT",
    path: `/users/${UNKNOWN_ID}/ministries`,
    body: { ministryIds: [] },
    expected: 403,
  },

  // Not signed in.
  ...(
    [
      "/roles",
      "/users",
      "/ministries",
      "/invitations",
      "/audit",
      "/me/permissions",
    ] as const
  ).map(
    (path): MatrixRow => ({
      who: "anonymous",
      caller: "anonymous",
      method: "GET",
      path,
      expected: 401,
    }),
  ),

  // Signed in with no permissions: only /me/permissions answers.
  {
    who: "no role",
    caller: NOTHING,
    method: "GET",
    path: "/me/permissions",
    expected: 200,
  },
  {
    who: "no role",
    caller: NOTHING,
    method: "GET",
    path: "/roles",
    expected: 403,
  },
  {
    who: "no role",
    caller: NOTHING,
    method: "GET",
    path: "/users",
    expected: 403,
  },
  {
    who: "no role",
    caller: NOTHING,
    method: "GET",
    path: "/ministries",
    expected: 403,
  },
  {
    who: "no role",
    caller: NOTHING,
    method: "GET",
    path: "/invitations",
    expected: 403,
  },
  {
    who: "no role",
    caller: NOTHING,
    method: "POST",
    path: "/roles",
    body: validRole,
    expected: 403,
  },

  // audit:view is the only door to the trail, and it has no write endpoints.
  {
    who: "no role",
    caller: NOTHING,
    method: "GET",
    path: "/audit",
    expected: 403,
  },
  {
    who: PERMISSIONS.audit.view,
    caller: [grant(PERMISSIONS.audit.view)],
    method: "GET",
    path: "/audit",
    expected: 200,
  },
  {
    who: PERMISSIONS.roles.view,
    caller: [grant(PERMISSIONS.roles.view)],
    method: "GET",
    path: "/audit",
    expected: 403,
  },

  // roles:*, one action at a time.
  {
    who: "no role",
    caller: NOTHING,
    method: "GET",
    path: `/roles/${UNKNOWN_ID}`,
    expected: 403,
  },
  {
    who: PERMISSIONS.roles.view,
    caller: [grant(PERMISSIONS.roles.view)],
    method: "GET",
    path: "/roles",
    expected: 200,
  },
  {
    who: PERMISSIONS.roles.view,
    caller: [grant(PERMISSIONS.roles.view)],
    method: "GET",
    path: `/roles/${UNKNOWN_ID}`,
    expected: 404,
  },
  {
    who: PERMISSIONS.roles.view,
    caller: [grant(PERMISSIONS.roles.view)],
    method: "POST",
    path: "/roles",
    body: validRole,
    expected: 403,
  },
  {
    who: PERMISSIONS.roles.view,
    caller: [grant(PERMISSIONS.roles.view)],
    method: "PATCH",
    path: `/roles/${UNKNOWN_ID}`,
    body: validRole,
    expected: 403,
  },
  {
    who: PERMISSIONS.roles.view,
    caller: [grant(PERMISSIONS.roles.view)],
    method: "DELETE",
    path: `/roles/${UNKNOWN_ID}`,
    expected: 403,
  },
  {
    who: PERMISSIONS.roles.create,
    caller: [grant(PERMISSIONS.roles.create)],
    method: "POST",
    path: "/roles",
    body: {},
    expected: 400,
  },
  {
    who: PERMISSIONS.roles.edit,
    caller: [grant(PERMISSIONS.roles.edit)],
    method: "PATCH",
    path: `/roles/${UNKNOWN_ID}`,
    body: validRole,
    expected: 403,
  },
  {
    who: PERMISSIONS.roles.delete,
    caller: [grant(PERMISSIONS.roles.delete)],
    method: "DELETE",
    path: `/roles/${UNKNOWN_ID}`,
    expected: 403,
  },

  // Managing roles is admin-only even with the permission; the admin reaches the 404.
  {
    who: "admin",
    caller: ["admin"],
    method: "PATCH",
    path: `/roles/${UNKNOWN_ID}`,
    body: validRole,
    expected: 404,
  },
  {
    who: "admin",
    caller: ["admin"],
    method: "DELETE",
    path: `/roles/${UNKNOWN_ID}`,
    expected: 404,
  },

  // users:*
  {
    who: PERMISSIONS.users.view,
    caller: [grant(PERMISSIONS.users.view)],
    method: "GET",
    path: "/users",
    expected: 200,
  },
  {
    who: PERMISSIONS.users.view,
    caller: [grant(PERMISSIONS.users.view)],
    method: "PUT",
    path: `/users/${UNKNOWN_ID}/roles`,
    body: { roleIds: [] },
    expected: 403,
  },
  {
    who: PERMISSIONS.users.edit,
    caller: [grant(PERMISSIONS.users.edit)],
    method: "PUT",
    path: `/users/${UNKNOWN_ID}/roles`,
    body: { roleIds: [] },
    expected: 404,
  },
  {
    who: PERMISSIONS.users.edit,
    caller: [grant(PERMISSIONS.users.edit)],
    method: "PUT",
    path: `/users/${UNKNOWN_ID}/ministries`,
    body: { ministryIds: [] },
    expected: 404,
  },
  {
    who: PERMISSIONS.users.edit,
    caller: [grant(PERMISSIONS.users.edit)],
    method: "GET",
    path: "/users",
    expected: 403,
  },

  // ministries: any scope on profile:view lets the call in; the scope filters the data.
  {
    who: "ministries.profile:view (ministry)",
    caller: [grant(PERMISSIONS.ministryProfile.view, "ministry")],
    method: "GET",
    path: "/ministries",
    expected: 200,
  },
  {
    who: PERMISSIONS.ministryFinance.view,
    caller: [grant(PERMISSIONS.ministryFinance.view, "all")],
    method: "GET",
    path: "/ministries",
    expected: 403,
  },
  {
    who: "seeded leader",
    caller: ["leader"],
    method: "GET",
    path: "/ministries",
    expected: 200,
  },
  {
    who: "seeded leader",
    caller: ["leader"],
    method: "GET",
    path: "/roles",
    expected: 403,
  },

  // invitations:*
  {
    who: PERMISSIONS.invitations.view,
    caller: [grant(PERMISSIONS.invitations.view)],
    method: "GET",
    path: "/invitations",
    expected: 200,
  },
  {
    who: PERMISSIONS.invitations.view,
    caller: [grant(PERMISSIONS.invitations.view)],
    method: "POST",
    path: "/invitations",
    body: {},
    expected: 403,
  },
  {
    who: PERMISSIONS.invitations.create,
    caller: [grant(PERMISSIONS.invitations.create)],
    method: "POST",
    path: "/invitations",
    body: {},
    expected: 400,
  },
  {
    who: PERMISSIONS.invitations.delete,
    caller: [grant(PERMISSIONS.invitations.delete)],
    method: "POST",
    path: `/invitations/${UNKNOWN_ID}/revoke`,
    expected: 404,
  },
  {
    who: PERMISSIONS.invitations.create,
    caller: [grant(PERMISSIONS.invitations.create)],
    method: "POST",
    path: `/invitations/${UNKNOWN_ID}/revoke`,
    expected: 403,
  },

  // site keys: view, create and delete are separate permissions.
  ...(
    [
      ["GET", "/site-keys"],
      ["POST", "/site-keys"],
      ["DELETE", `/site-keys/${UNKNOWN_ID}`],
    ] as const
  ).map(
    ([method, path]): MatrixRow => ({
      who: "anonymous",
      caller: "anonymous",
      method,
      path,
      body: method === "POST" ? { name: "web" } : undefined,
      expected: 401,
    }),
  ),
  {
    who: "no role",
    caller: NOTHING,
    method: "GET",
    path: "/site-keys",
    expected: 403,
  },
  {
    who: PERMISSIONS.siteKeys.view,
    caller: [grant(PERMISSIONS.siteKeys.view)],
    method: "GET",
    path: "/site-keys",
    expected: 200,
  },
  {
    who: PERMISSIONS.siteKeys.view,
    caller: [grant(PERMISSIONS.siteKeys.view)],
    method: "POST",
    path: "/site-keys",
    body: { name: "web" },
    expected: 403,
  },
  {
    who: PERMISSIONS.siteKeys.view,
    caller: [grant(PERMISSIONS.siteKeys.view)],
    method: "DELETE",
    path: `/site-keys/${UNKNOWN_ID}`,
    expected: 403,
  },
  {
    who: PERMISSIONS.siteKeys.create,
    caller: [grant(PERMISSIONS.siteKeys.create)],
    method: "POST",
    path: "/site-keys",
    body: {},
    expected: 400,
  },
  {
    who: PERMISSIONS.siteKeys.create,
    caller: [grant(PERMISSIONS.siteKeys.create)],
    method: "GET",
    path: "/site-keys",
    expected: 403,
  },
  {
    who: PERMISSIONS.siteKeys.delete,
    caller: [grant(PERMISSIONS.siteKeys.delete)],
    method: "DELETE",
    path: `/site-keys/${UNKNOWN_ID}`,
    expected: 404,
  },

  // site settings: view reads, edit writes.
  ...(
    [
      ["GET", undefined],
      ["PATCH", { version: 0 }],
    ] as const
  ).map(
    ([method, body]): MatrixRow => ({
      who: "anonymous",
      caller: "anonymous",
      method,
      path: "/site/settings",
      body,
      expected: 401,
    }),
  ),
  {
    who: "no role",
    caller: NOTHING,
    method: "GET",
    path: "/site/settings",
    expected: 403,
  },
  {
    who: "no role",
    caller: NOTHING,
    method: "PATCH",
    path: "/site/settings",
    body: { version: 0 },
    expected: 403,
  },
  {
    who: PERMISSIONS.site.view,
    caller: [grant(PERMISSIONS.site.view)],
    method: "GET",
    path: "/site/settings",
    expected: 200,
  },
  {
    who: PERMISSIONS.site.view,
    caller: [grant(PERMISSIONS.site.view)],
    method: "PATCH",
    path: "/site/settings",
    body: { version: 0 },
    expected: 403,
  },
  {
    who: PERMISSIONS.site.edit,
    caller: [grant(PERMISSIONS.site.edit)],
    method: "GET",
    path: "/site/settings",
    expected: 403,
  },
  {
    // A body with no version never reaches the use case: 400 proves the guard let it through.
    who: PERMISSIONS.site.edit,
    caller: [grant(PERMISSIONS.site.edit)],
    method: "PATCH",
    path: "/site/settings",
    body: {},
    expected: 400,
  },

  // visit page content: view reads, edit writes.
  ...(
    [
      ["GET", undefined],
      ["PUT", { directions: {}, faqs: [] }],
    ] as const
  ).flatMap(([method, body]): MatrixRow[] => [
    {
      who: "anonymous",
      caller: "anonymous",
      method,
      path: "/site/visit",
      body,
      expected: 401,
    },
    {
      who: "no role",
      caller: NOTHING,
      method,
      path: "/site/visit",
      body,
      expected: 403,
    },
  ]),
  {
    who: PERMISSIONS.visit.view,
    caller: [grant(PERMISSIONS.visit.view)],
    method: "GET",
    path: "/site/visit",
    expected: 200,
  },
  {
    who: PERMISSIONS.visit.view,
    caller: [grant(PERMISSIONS.visit.view)],
    method: "PUT",
    path: "/site/visit",
    body: { directions: {}, faqs: [] },
    expected: 403,
  },
  {
    who: PERMISSIONS.visit.edit,
    caller: [grant(PERMISSIONS.visit.edit)],
    method: "GET",
    path: "/site/visit",
    expected: 403,
  },
  {
    // `{}` never reaches the use case: a 400 proves the guard let the caller through.
    who: PERMISSIONS.visit.edit,
    caller: [grant(PERMISSIONS.visit.edit)],
    method: "PUT",
    path: "/site/visit",
    body: {},
    expected: 400,
  },

  // people profiles: view reads, create/edit/delete write. A `{}` body never reaches the use case,
  // so a 400 (or the 404 of an unknown id) proves the guard let the caller through.
  ...(
    [
      ["GET", "/content/people", undefined],
      ["POST", "/content/people", {}],
      ["GET", `/content/people/${UNKNOWN_ID}`, undefined],
      ["PATCH", `/content/people/${UNKNOWN_ID}`, {}],
      ["DELETE", `/content/people/${UNKNOWN_ID}`, undefined],
    ] as const
  ).map(
    ([method, path, body]): MatrixRow => ({
      who: "anonymous",
      caller: "anonymous",
      method,
      path,
      body,
      expected: 401,
    }),
  ),
  ...(
    [
      ["GET", "/content/people", undefined],
      ["POST", "/content/people", {}],
      ["PATCH", `/content/people/${UNKNOWN_ID}`, {}],
      ["DELETE", `/content/people/${UNKNOWN_ID}`, undefined],
    ] as const
  ).map(
    ([method, path, body]): MatrixRow => ({
      who: "no role",
      caller: NOTHING,
      method,
      path,
      body,
      expected: 403,
    }),
  ),
  ...(
    [
      ["POST", "/content/people", {}],
      ["PATCH", `/content/people/${UNKNOWN_ID}`, {}],
      ["DELETE", `/content/people/${UNKNOWN_ID}`, undefined],
    ] as const
  ).map(
    ([method, path, body]): MatrixRow => ({
      who: PERMISSIONS.people.view,
      caller: [grant(PERMISSIONS.people.view)],
      method,
      path,
      body,
      expected: 403,
    }),
  ),
  {
    who: PERMISSIONS.people.view,
    caller: [grant(PERMISSIONS.people.view)],
    method: "GET",
    path: "/content/people",
    expected: 200,
  },
  {
    who: PERMISSIONS.people.view,
    caller: [grant(PERMISSIONS.people.view)],
    method: "GET",
    path: `/content/people/${UNKNOWN_ID}`,
    expected: 404,
  },
  {
    who: PERMISSIONS.people.create,
    caller: [grant(PERMISSIONS.people.create)],
    method: "POST",
    path: "/content/people",
    body: {},
    expected: 400,
  },
  {
    who: PERMISSIONS.people.create,
    caller: [grant(PERMISSIONS.people.create)],
    method: "GET",
    path: "/content/people",
    expected: 403,
  },
  {
    who: PERMISSIONS.people.edit,
    caller: [grant(PERMISSIONS.people.edit)],
    method: "PATCH",
    path: `/content/people/${UNKNOWN_ID}`,
    body: {},
    expected: 400,
  },
  {
    who: PERMISSIONS.people.delete,
    caller: [grant(PERMISSIONS.people.delete)],
    method: "DELETE",
    path: `/content/people/${UNKNOWN_ID}`,
    expected: 404,
  },

  // simple pages: pages:view lists, pages:create creates; the content goes through the editorial
  // routes (below), guarded by the pages:view/edit/publish permissions.
  ...(
    [
      ["GET", "/content/pages"],
      ["POST", "/content/pages"],
    ] as const
  ).flatMap(([method, path]): MatrixRow[] => [
    { who: "anonymous", caller: "anonymous", method, path, expected: 401 },
    { who: "no role", caller: NOTHING, method, path, expected: 403 },
  ]),
  {
    who: PERMISSIONS.pages.view,
    caller: [grant(PERMISSIONS.pages.view)],
    method: "POST",
    path: "/content/pages",
    expected: 403,
  },
  {
    who: PERMISSIONS.pages.view,
    caller: [grant(PERMISSIONS.pages.view)],
    method: "GET",
    path: "/content/pages",
    expected: 200,
  },
  {
    who: PERMISSIONS.pages.create,
    caller: [grant(PERMISSIONS.pages.create)],
    method: "GET",
    path: "/content/pages",
    expected: 403,
  },
  {
    who: PERMISSIONS.pages.create,
    caller: [grant(PERMISSIONS.pages.create)],
    method: "POST",
    path: "/content/pages",
    expected: 201,
  },
  {
    who: PERMISSIONS.pages.view,
    caller: [grant(PERMISSIONS.pages.view)],
    method: "GET",
    path: `/editorial/simple-page/${UNKNOWN_ID}`,
    expected: 404,
  },
  {
    who: PERMISSIONS.pages.view,
    caller: [grant(PERMISSIONS.pages.view)],
    method: "PUT",
    path: `/editorial/simple-page/${UNKNOWN_ID}/draft`,
    body: { snapshot: {} },
    expected: 403,
  },
  {
    who: PERMISSIONS.pages.view,
    caller: [grant(PERMISSIONS.pages.view)],
    method: "POST",
    path: `/editorial/simple-page/${UNKNOWN_ID}/publish`,
    expected: 403,
  },
  {
    who: PERMISSIONS.pages.edit,
    caller: [grant(PERMISSIONS.pages.edit)],
    method: "POST",
    path: `/editorial/simple-page/${UNKNOWN_ID}/submit`,
    expected: 404,
  },
  {
    who: PERMISSIONS.pages.edit,
    caller: [grant(PERMISSIONS.pages.edit)],
    method: "POST",
    path: `/editorial/simple-page/${UNKNOWN_ID}/publish`,
    expected: 403,
  },
  {
    who: PERMISSIONS.pages.publish,
    caller: [grant(PERMISSIONS.pages.publish)],
    method: "POST",
    path: `/editorial/simple-page/${UNKNOWN_ID}/pause`,
    expected: 404,
  },
  {
    who: PERMISSIONS.pages.publish,
    caller: [grant(PERMISSIONS.pages.publish)],
    method: "GET",
    path: `/editorial/simple-page/${UNKNOWN_ID}`,
    expected: 403,
  },

  // blog: posts are created with content.posts:create; categories and series are plain data
  // (not editorial) guarded by the same resource: view lists, edit creates, edits and deletes.
  ...(
    [
      ["GET", "/content/posts", undefined],
      ["POST", "/content/posts", undefined],
      ["GET", "/content/categories", undefined],
      ["POST", "/content/categories", {}],
      ["PATCH", `/content/categories/${UNKNOWN_ID}`, {}],
      ["DELETE", `/content/categories/${UNKNOWN_ID}`, undefined],
      ["GET", "/content/series", undefined],
      ["POST", "/content/series", {}],
      ["PATCH", `/content/series/${UNKNOWN_ID}`, {}],
      ["DELETE", `/content/series/${UNKNOWN_ID}`, undefined],
    ] as const
  ).flatMap(([method, path, body]): MatrixRow[] => [
    {
      who: "anonymous",
      caller: "anonymous",
      method,
      path,
      body,
      expected: 401,
    },
    { who: "no role", caller: NOTHING, method, path, body, expected: 403 },
  ]),
  {
    who: PERMISSIONS.blogPosts.view,
    caller: [grant(PERMISSIONS.blogPosts.view)],
    method: "GET",
    path: "/content/posts",
    expected: 200,
  },
  {
    who: PERMISSIONS.blogPosts.view,
    caller: [grant(PERMISSIONS.blogPosts.view)],
    method: "POST",
    path: "/content/posts",
    expected: 403,
  },
  {
    who: PERMISSIONS.blogPosts.create,
    caller: [grant(PERMISSIONS.blogPosts.create)],
    method: "GET",
    path: "/content/posts",
    expected: 403,
  },
  {
    who: PERMISSIONS.blogPosts.create,
    caller: [grant(PERMISSIONS.blogPosts.create)],
    method: "POST",
    path: "/content/posts",
    expected: 201,
  },
  ...(["categories", "series"] as const).flatMap((resource): MatrixRow[] => [
    {
      who: PERMISSIONS.blogPosts.view,
      caller: [grant(PERMISSIONS.blogPosts.view)],
      method: "GET",
      path: `/content/${resource}`,
      expected: 200,
    },
    {
      who: PERMISSIONS.blogPosts.view,
      caller: [grant(PERMISSIONS.blogPosts.view)],
      method: "POST",
      path: `/content/${resource}`,
      body: {},
      expected: 403,
    },
    {
      who: PERMISSIONS.blogPosts.view,
      caller: [grant(PERMISSIONS.blogPosts.view)],
      method: "PATCH",
      path: `/content/${resource}/${UNKNOWN_ID}`,
      body: {},
      expected: 403,
    },
    {
      who: PERMISSIONS.blogPosts.view,
      caller: [grant(PERMISSIONS.blogPosts.view)],
      method: "DELETE",
      path: `/content/${resource}/${UNKNOWN_ID}`,
      expected: 403,
    },
    {
      who: PERMISSIONS.blogPosts.edit,
      caller: [grant(PERMISSIONS.blogPosts.edit)],
      method: "GET",
      path: `/content/${resource}`,
      expected: 403,
    },
    {
      who: PERMISSIONS.blogPosts.edit,
      caller: [grant(PERMISSIONS.blogPosts.edit)],
      method: "POST",
      path: `/content/${resource}`,
      body: {},
      expected: 400,
    },
    {
      who: PERMISSIONS.blogPosts.edit,
      caller: [grant(PERMISSIONS.blogPosts.edit)],
      method: "PATCH",
      path: `/content/${resource}/${UNKNOWN_ID}`,
      body: {},
      expected: 400,
    },
    {
      who: PERMISSIONS.blogPosts.edit,
      caller: [grant(PERMISSIONS.blogPosts.edit)],
      method: "DELETE",
      path: `/content/${resource}/${UNKNOWN_ID}`,
      expected: 404,
    },
  ]),

  // media: the permission is the one of the file's purpose (content:create, vouchers:create...).
  {
    who: "anonymous",
    caller: "anonymous",
    method: "POST",
    path: "/media/uploads",
    body: imageUpload,
    expected: 401,
  },
  {
    who: "anonymous",
    caller: "anonymous",
    method: "POST",
    path: `/media/uploads/${UNKNOWN_ID}/finalize`,
    expected: 401,
  },
  {
    who: "anonymous",
    caller: "anonymous",
    method: "GET",
    path: `/media/${UNKNOWN_ID}/download`,
    expected: 401,
  },
  {
    who: "no role",
    caller: NOTHING,
    method: "POST",
    path: "/media/uploads",
    body: imageUpload,
    expected: 403,
  },
  {
    who: "no role",
    caller: NOTHING,
    method: "POST",
    path: "/media/uploads",
    body: voucherUpload,
    expected: 403,
  },
  {
    who: PERMISSIONS.content.create,
    caller: [grant(PERMISSIONS.content.create)],
    method: "POST",
    path: "/media/uploads",
    body: {},
    expected: 400,
  },
  {
    who: PERMISSIONS.content.create,
    caller: [grant(PERMISSIONS.content.create)],
    method: "POST",
    path: "/media/uploads",
    body: voucherUpload,
    expected: 403,
  },
  {
    who: PERMISSIONS.vouchers.create,
    caller: [grant(PERMISSIONS.vouchers.create, "own")],
    method: "POST",
    path: "/media/uploads",
    body: imageUpload,
    expected: 403,
  },
  {
    who: PERMISSIONS.vouchers.create,
    caller: [grant(PERMISSIONS.vouchers.create, "own")],
    method: "POST",
    path: "/media/uploads",
    body: {},
    expected: 400,
  },
  {
    who: "no role (any session reaches the owner check)",
    caller: NOTHING,
    method: "POST",
    path: `/media/uploads/${UNKNOWN_ID}/finalize`,
    expected: 404,
  },
  {
    who: "no role (any session reaches the owner check)",
    caller: NOTHING,
    method: "GET",
    path: `/media/${UNKNOWN_ID}/download`,
    expected: 404,
  },

  // The cron routes have no session: only the bearer opens them, not even the admin role.
  {
    who: "anonymous",
    caller: "anonymous",
    method: "GET",
    path: "/internal/media/purge",
    expected: 401,
  },
  {
    who: "admin (a session is not the cron secret)",
    caller: ["admin"],
    method: "GET",
    path: "/internal/media/purge",
    expected: 401,
  },
  {
    who: "anonymous",
    caller: "anonymous",
    method: "GET",
    path: "/internal/blog/views/purge",
    expected: 401,
  },
  {
    who: "admin (a session is not the cron secret)",
    caller: ["admin"],
    method: "GET",
    path: "/internal/blog/views/purge",
    expected: 401,
  },

  {
    who: "anonymous",
    caller: "anonymous",
    method: "GET",
    path: "/internal/calendar/reminders",
    expected: 401,
  },
  {
    who: "admin (a session is not the cron secret)",
    caller: ["admin"],
    method: "GET",
    path: "/internal/calendar/reminders",
    expected: 401,
  },

  // editorial: each route is guarded by the permission of the content type (blog posts here).
  ...(
    [
      ["GET", `/editorial/blog-post/${UNKNOWN_ID}`],
      ["GET", `/editorial/blog-post/${UNKNOWN_ID}/history`],
      ["PUT", `/editorial/blog-post/${UNKNOWN_ID}/draft`],
      ["POST", `/editorial/blog-post/${UNKNOWN_ID}/submit`],
      ["POST", `/editorial/blog-post/${UNKNOWN_ID}/publish`],
      ["POST", `/editorial/blog-post/${UNKNOWN_ID}/pause`],
      ["POST", `/editorial/blog-post/${UNKNOWN_ID}/approve`],
      ["POST", `/editorial/blog-post/${UNKNOWN_ID}/request-changes`],
      ["GET", "/editorial/inbox"],
      ["GET", "/editorial/settings"],
      ["PUT", "/editorial/settings/blog-post"],
    ] as const
  ).flatMap(([method, path]): MatrixRow[] => [
    {
      who: "anonymous",
      caller: "anonymous",
      method,
      path,
      body: EDITORIAL_BODIES[path.split("/").at(-1) as string],
      expected: 401,
    },
    ...(path === "/editorial/inbox"
      ? []
      : [
          {
            who: "no role",
            caller: NOTHING,
            method,
            path,
            body: EDITORIAL_BODIES[path.split("/").at(-1) as string],
            expected: 403,
          } satisfies MatrixRow,
        ]),
  ]),
  {
    who: "no role (any session reaches the inbox)",
    caller: NOTHING,
    method: "GET",
    path: "/editorial/inbox",
    expected: 200,
  },
  {
    who: PERMISSIONS.blogPosts.view,
    caller: [grant(PERMISSIONS.blogPosts.view)],
    method: "GET",
    path: blogPostPath(""),
    expected: 200,
  },
  {
    who: PERMISSIONS.blogPosts.view,
    caller: [grant(PERMISSIONS.blogPosts.view)],
    method: "GET",
    path: blogPostPath("/history"),
    expected: 200,
  },
  {
    who: PERMISSIONS.blogPosts.view,
    caller: [grant(PERMISSIONS.blogPosts.view)],
    method: "PUT",
    path: blogPostPath("/draft"),
    body: { snapshot: {} },
    expected: 403,
  },
  {
    who: PERMISSIONS.blogPosts.view,
    caller: [grant(PERMISSIONS.blogPosts.view)],
    method: "POST",
    path: blogPostPath("/publish"),
    expected: 403,
  },
  {
    who: PERMISSIONS.blogPosts.edit,
    caller: [grant(PERMISSIONS.blogPosts.edit)],
    method: "POST",
    path: blogPostPath("/submit"),
    expected: 409,
  },
  {
    who: PERMISSIONS.blogPosts.edit,
    caller: [grant(PERMISSIONS.blogPosts.edit)],
    method: "POST",
    path: blogPostPath("/publish"),
    expected: 403,
  },
  {
    who: PERMISSIONS.blogPosts.publish,
    caller: [grant(PERMISSIONS.blogPosts.publish)],
    method: "POST",
    path: blogPostPath("/pause"),
    expected: 409,
  },
  {
    who: PERMISSIONS.blogPosts.publish,
    caller: [grant(PERMISSIONS.blogPosts.publish)],
    method: "GET",
    path: blogPostPath(""),
    expected: 403,
  },
  {
    who: "view without being a reviewer",
    caller: [grant(PERMISSIONS.blogPosts.view)],
    method: "POST",
    path: blogPostPath("/approve"),
    expected: 403,
  },
  {
    who: "admin (a reviewer) with nothing in review",
    caller: ["admin"],
    method: "POST",
    path: blogPostPath("/approve"),
    expected: 409,
  },
  {
    who: PERMISSIONS.blogPosts.view,
    caller: [grant(PERMISSIONS.blogPosts.view)],
    method: "GET",
    path: `/editorial/blog-post/${UNKNOWN_ID}`,
    expected: 404,
  },
  {
    who: PERMISSIONS.blogPosts.edit,
    caller: [grant(PERMISSIONS.blogPosts.edit)],
    method: "POST",
    path: `/editorial/blog-post/${UNKNOWN_ID}/submit`,
    expected: 404,
  },
  {
    who: "admin",
    caller: ["admin"],
    method: "GET",
    path: `/editorial/nope/${UNKNOWN_ID}`,
    expected: 404,
  },
  {
    who: PERMISSIONS.editorial.view,
    caller: [grant(PERMISSIONS.editorial.view)],
    method: "GET",
    path: "/editorial/settings",
    expected: 200,
  },
  {
    who: PERMISSIONS.editorial.view,
    caller: [grant(PERMISSIONS.editorial.view)],
    method: "PUT",
    path: "/editorial/settings/blog-post",
    body: EDITORIAL_BODIES["blog-post"],
    expected: 403,
  },
  {
    who: PERMISSIONS.editorial.edit,
    caller: [grant(PERMISSIONS.editorial.edit)],
    method: "GET",
    path: "/editorial/settings",
    expected: 403,
  },
  {
    who: PERMISSIONS.editorial.edit,
    caller: [grant(PERMISSIONS.editorial.edit)],
    method: "PUT",
    path: "/editorial/settings/blog-post",
    body: {},
    expected: 400,
  },
  // A leader holds ministry-scoped profile permissions: a ministry that is not theirs is a 403.
  {
    who: "seeded leader on a ministry that is not theirs",
    caller: ["leader"],
    method: "PUT",
    path: `/editorial/ministry/${UNKNOWN_ID}/draft`,
    body: { snapshot: {} },
    expected: 403,
  },
  {
    who: "seeded leader on a ministry that is not theirs",
    caller: ["leader"],
    method: "GET",
    path: `/editorial/ministry/${UNKNOWN_ID}`,
    expected: 403,
  },

  // ministry profile and settings: view lists, create makes ministries, edit changes settings,
  // leaders, the mosaic and the categories. A role with only treasury (ministryFinance) gets none.
  ...(
    [
      ["GET", "/content/ministries", undefined],
      ["POST", "/content/ministries", {}],
      ["PATCH", `/content/ministries/${UNKNOWN_ID}/settings`, {}],
      ["PUT", `/content/ministries/${UNKNOWN_ID}/leaders`, []],
      ["PATCH", "/content/ministries/landing", []],
      ["GET", "/content/ministry-categories", undefined],
      ["POST", "/content/ministry-categories", {}],
      ["PATCH", `/content/ministry-categories/${UNKNOWN_ID}`, {}],
      ["DELETE", `/content/ministry-categories/${UNKNOWN_ID}`, undefined],
    ] as const
  ).flatMap(([method, path, body]): MatrixRow[] => [
    {
      who: "anonymous",
      caller: "anonymous",
      method,
      path,
      body,
      expected: 401,
    },
    { who: "no role", caller: NOTHING, method, path, body, expected: 403 },
    {
      who: PERMISSIONS.ministryFinance.view,
      caller: [grant(PERMISSIONS.ministryFinance.view, "all")],
      method,
      path,
      body,
      expected: 403,
    },
  ]),
  {
    who: PERMISSIONS.ministryProfile.view,
    caller: [grant(PERMISSIONS.ministryProfile.view, "ministry")],
    method: "GET",
    path: "/content/ministries",
    expected: 200,
  },
  {
    who: PERMISSIONS.ministryProfile.view,
    caller: [grant(PERMISSIONS.ministryProfile.view, "all")],
    method: "PATCH",
    path: `/content/ministries/${UNKNOWN_ID}/settings`,
    body: {},
    expected: 403,
  },
  {
    who: PERMISSIONS.ministryProfile.view,
    caller: [grant(PERMISSIONS.ministryProfile.view, "all")],
    method: "GET",
    path: "/content/ministry-categories",
    expected: 200,
  },
  {
    who: PERMISSIONS.ministryProfile.edit,
    caller: [grant(PERMISSIONS.ministryProfile.edit, "all")],
    method: "PATCH",
    path: "/content/ministries/landing",
    body: [],
    expected: 200,
  },
  {
    who: PERMISSIONS.ministryProfile.edit,
    caller: [grant(PERMISSIONS.ministryProfile.edit, "all")],
    method: "GET",
    path: "/content/ministries",
    expected: 403,
  },
  {
    who: "ministries.profile:edit (ministry)",
    caller: [grant(PERMISSIONS.ministryProfile.edit, "ministry")],
    method: "PATCH",
    path: "/content/ministries/landing",
    body: [],
    expected: 403,
  },
  {
    who: PERMISSIONS.ministryProfile.create,
    caller: [grant(PERMISSIONS.ministryProfile.create, "all")],
    method: "POST",
    path: "/content/ministries",
    body: {},
    expected: 400,
  },

  // calendar schedules (sets, activities, exceptions, places): events:view reads, events:edit
  // changes. A role with only treasury gets none.
  ...(
    [
      ["GET", "/content/calendar/schedule-sets", undefined],
      ["POST", "/content/calendar/schedule-sets", {}],
      ["PATCH", `/content/calendar/schedule-sets/${UNKNOWN_ID}`, {}],
      ["DELETE", `/content/calendar/schedule-sets/${UNKNOWN_ID}`, undefined],
      ["GET", "/content/calendar/activities", undefined],
      ["POST", "/content/calendar/activities", {}],
      ["PATCH", `/content/calendar/activities/${UNKNOWN_ID}`, {}],
      ["DELETE", `/content/calendar/activities/${UNKNOWN_ID}`, undefined],
      ["GET", "/content/calendar/exceptions", undefined],
      ["POST", "/content/calendar/exceptions", {}],
      ["PATCH", `/content/calendar/exceptions/${UNKNOWN_ID}`, {}],
      ["DELETE", `/content/calendar/exceptions/${UNKNOWN_ID}`, undefined],
      ["GET", "/content/calendar/places", undefined],
      ["POST", "/content/calendar/places", {}],
      ["PATCH", `/content/calendar/places/${UNKNOWN_ID}`, {}],
      ["DELETE", `/content/calendar/places/${UNKNOWN_ID}`, undefined],
    ] as const
  ).flatMap(([method, path, body]): MatrixRow[] => [
    {
      who: "anonymous",
      caller: "anonymous",
      method,
      path,
      body,
      expected: 401,
    },
    { who: "no role", caller: NOTHING, method, path, body, expected: 403 },
    {
      who: PERMISSIONS.ministryFinance.view,
      caller: [grant(PERMISSIONS.ministryFinance.view, "all")],
      method,
      path,
      body,
      expected: 403,
    },
    // Viewing is not editing.
    ...(method === "GET"
      ? []
      : [
          {
            who: PERMISSIONS.events.view,
            caller: [grant(PERMISSIONS.events.view)],
            method,
            path,
            body,
            expected: 403,
          },
        ]),
  ]),
  ...(
    [
      "/content/calendar/schedule-sets",
      "/content/calendar/activities",
      "/content/calendar/exceptions",
      "/content/calendar/places",
    ] as const
  ).flatMap((path): MatrixRow[] => [
    {
      who: PERMISSIONS.events.view,
      caller: [grant(PERMISSIONS.events.view)],
      method: "GET",
      path,
      expected: 200,
    },
    {
      who: PERMISSIONS.events.edit,
      caller: [grant(PERMISSIONS.events.edit)],
      method: "POST",
      path,
      body: {},
      expected: 400,
    },
    {
      who: PERMISSIONS.events.edit,
      caller: [grant(PERMISSIONS.events.edit)],
      method: "GET",
      path,
      expected: 403,
    },
  ]),
  {
    who: PERMISSIONS.events.edit,
    caller: [grant(PERMISSIONS.events.edit)],
    method: "DELETE",
    path: `/content/calendar/places/${UNKNOWN_ID}`,
    expected: 404,
  },

  // calendar events and years: events:view reads, create/edit/delete write, calendar.year:publish
  // publishes a year. Each write route is guarded by its own action, not by the others.
  ...(
    [
      ["GET", "/content/calendar/events", undefined],
      ["POST", "/content/calendar/events", {}],
      ["PATCH", `/content/calendar/events/${UNKNOWN_ID}/settings`, {}],
      ["DELETE", `/content/calendar/events/${UNKNOWN_ID}`, undefined],
      ["GET", "/content/calendar/years", undefined],
      ["POST", "/content/calendar/years", {}],
      ["POST", "/content/calendar/years/2099/publish", undefined],
      ["POST", "/content/calendar/years/2099/copy", {}],
      ["POST", "/content/calendar/years/2099/reviews", {}],
    ] as const
  ).flatMap(([method, path, body]): MatrixRow[] => [
    {
      who: "anonymous",
      caller: "anonymous",
      method,
      path,
      body,
      expected: 401,
    },
    { who: "no role", caller: NOTHING, method, path, body, expected: 403 },
    {
      who: PERMISSIONS.ministryFinance.view,
      caller: [grant(PERMISSIONS.ministryFinance.view, "all")],
      method,
      path,
      body,
      expected: 403,
    },
    // Viewing is not writing.
    ...(method === "GET"
      ? []
      : [
          {
            who: PERMISSIONS.events.view,
            caller: [grant(PERMISSIONS.events.view)],
            method,
            path,
            body,
            expected: 403,
          },
        ]),
  ]),
  ...(
    ["/content/calendar/events?year=2090", "/content/calendar/years"] as const
  ).map(
    (path): MatrixRow => ({
      who: PERMISSIONS.events.view,
      caller: [grant(PERMISSIONS.events.view)],
      method: "GET",
      path,
      expected: 200,
    }),
  ),
  {
    who: PERMISSIONS.events.create,
    caller: [grant(PERMISSIONS.events.create)],
    method: "POST",
    path: "/content/calendar/events",
    body: {},
    expected: 400,
  },
  // calendar reminders: events:view reads (recipients and pending), events:edit changes the recipients.
  ...(
    [
      ["GET", "/content/calendar/reminders", undefined],
      ["PUT", "/content/calendar/reminders", {}],
      ["GET", "/content/calendar/pending", undefined],
    ] as const
  ).flatMap(([method, path, body]): MatrixRow[] => [
    {
      who: "anonymous",
      caller: "anonymous",
      method,
      path,
      body,
      expected: 401,
    },
    { who: "no role", caller: NOTHING, method, path, body, expected: 403 },
    {
      who: PERMISSIONS.ministryFinance.view,
      caller: [grant(PERMISSIONS.ministryFinance.view, "all")],
      method,
      path,
      body,
      expected: 403,
    },
    ...(method === "GET"
      ? [
          {
            who: PERMISSIONS.events.view,
            caller: [grant(PERMISSIONS.events.view)],
            method,
            path,
            expected: 200,
          },
        ]
      : [
          {
            who: PERMISSIONS.events.view,
            caller: [grant(PERMISSIONS.events.view)],
            method,
            path,
            body,
            expected: 403,
          },
          {
            who: PERMISSIONS.events.edit,
            caller: [grant(PERMISSIONS.events.edit)],
            method,
            path,
            body,
            expected: 400,
          },
        ]),
  ]),
  // Creating needs `create`; `edit` alone does not.
  {
    who: PERMISSIONS.events.edit,
    caller: [grant(PERMISSIONS.events.edit)],
    method: "POST",
    path: "/content/calendar/events",
    body: {},
    expected: 403,
  },
  {
    who: PERMISSIONS.events.edit,
    caller: [grant(PERMISSIONS.events.edit)],
    method: "PATCH",
    path: `/content/calendar/events/${UNKNOWN_ID}/settings`,
    body: {},
    expected: 400,
  },
  {
    who: PERMISSIONS.events.edit,
    caller: [grant(PERMISSIONS.events.edit)],
    method: "DELETE",
    path: `/content/calendar/events/${UNKNOWN_ID}`,
    expected: 403,
  },
  {
    who: PERMISSIONS.events.delete,
    caller: [grant(PERMISSIONS.events.delete)],
    method: "DELETE",
    path: `/content/calendar/events/${UNKNOWN_ID}`,
    expected: 404,
  },
  ...(
    [
      ["POST", "/content/calendar/years", {}],
      ["POST", "/content/calendar/years/2099/copy", {}],
      ["POST", "/content/calendar/years/2099/reviews", {}],
    ] as const
  ).map(
    ([method, path, body]): MatrixRow => ({
      who: PERMISSIONS.events.edit,
      caller: [grant(PERMISSIONS.events.edit)],
      method,
      path,
      body,
      expected: 400,
    }),
  ),
  // Publishing a year is its own permission: `events.publish` (a single event) does not reach it.
  {
    who: PERMISSIONS.events.publish,
    caller: [grant(PERMISSIONS.events.publish)],
    method: "POST",
    path: "/content/calendar/years/2099/publish",
    expected: 403,
  },
  {
    who: PERMISSIONS.calendarYear.publish,
    caller: [grant(PERMISSIONS.calendarYear.publish)],
    method: "POST",
    path: "/content/calendar/years/2099/publish",
    expected: 404,
  },
  // An internal event is a 404 on the editorial routes for whoever is not in its audience.
  {
    who: PERMISSIONS.events.view,
    caller: [grant(PERMISSIONS.events.view)],
    method: "GET",
    path: `/editorial/event/${UNKNOWN_ID}`,
    expected: 404,
  },
  {
    who: PERMISSIONS.ministryFinance.view,
    caller: [grant(PERMISSIONS.ministryFinance.view, "all")],
    method: "GET",
    path: `/editorial/event/${UNKNOWN_ID}`,
    expected: 403,
  },

  // sermons: view lists, create makes a sermon from a video, delete removes one that is not live.
  // The video lookup and the channel suggestions are open to whoever may create a sermon or a
  // podcast episode. With no YOUTUBE_API_KEY in the test environment a permitted call that gets
  // past validation is a 503.
  ...(
    [
      ["GET", "/content/sermons", undefined],
      ["POST", "/content/sermons", {}],
      ["DELETE", `/content/sermons/${UNKNOWN_ID}`, undefined],
      ["POST", "/content/platform-lookup", {}],
      ["GET", "/content/platform/suggestions", undefined],
    ] as const
  ).flatMap(([method, path, body]): MatrixRow[] => [
    {
      who: "anonymous",
      caller: "anonymous",
      method,
      path,
      body,
      expected: 401,
    },
    { who: "no role", caller: NOTHING, method, path, body, expected: 403 },
    {
      who: PERMISSIONS.ministryFinance.view,
      caller: [grant(PERMISSIONS.ministryFinance.view, "all")],
      method,
      path,
      body,
      expected: 403,
    },
  ]),
  {
    who: PERMISSIONS.sermons.view,
    caller: [grant(PERMISSIONS.sermons.view)],
    method: "GET",
    path: "/content/sermons",
    expected: 200,
  },
  ...(
    [
      ["POST", "/content/sermons", {}],
      ["DELETE", `/content/sermons/${UNKNOWN_ID}`, undefined],
      ["POST", "/content/platform-lookup", {}],
      ["GET", "/content/platform/suggestions", undefined],
    ] as const
  ).map(
    ([method, path, body]): MatrixRow => ({
      who: PERMISSIONS.sermons.view,
      caller: [grant(PERMISSIONS.sermons.view)],
      method,
      path,
      body,
      expected: 403,
    }),
  ),
  {
    who: PERMISSIONS.sermons.create,
    caller: [grant(PERMISSIONS.sermons.create)],
    method: "GET",
    path: "/content/sermons",
    expected: 403,
  },
  {
    who: PERMISSIONS.sermons.create,
    caller: [grant(PERMISSIONS.sermons.create)],
    method: "POST",
    path: "/content/sermons",
    body: {},
    expected: 400,
  },
  {
    who: PERMISSIONS.sermons.create,
    caller: [grant(PERMISSIONS.sermons.create)],
    method: "DELETE",
    path: `/content/sermons/${UNKNOWN_ID}`,
    expected: 403,
  },
  {
    who: PERMISSIONS.sermons.delete,
    caller: [grant(PERMISSIONS.sermons.delete)],
    method: "DELETE",
    path: `/content/sermons/${UNKNOWN_ID}`,
    expected: 404,
  },
  ...(
    [PERMISSIONS.sermons.create, PERMISSIONS.podcasts.create] as const
  ).flatMap((permission): MatrixRow[] => [
    {
      who: permission,
      caller: [grant(permission)],
      method: "POST",
      path: "/content/platform-lookup",
      body: {},
      expected: 400,
    },
    {
      who: permission,
      caller: [grant(permission)],
      method: "GET",
      path: "/content/platform/suggestions",
      expected: 503,
    },
  ]),

  // The seeded admin holds everything, resources added later included.
  {
    who: "admin",
    caller: ["admin"],
    method: "GET",
    path: "/roles",
    expected: 200,
  },
  {
    who: "admin",
    caller: ["admin"],
    method: "GET",
    path: "/users",
    expected: 200,
  },
  {
    who: "admin",
    caller: ["admin"],
    method: "GET",
    path: "/ministries",
    expected: 200,
  },
  {
    who: "admin",
    caller: ["admin"],
    method: "GET",
    path: "/invitations",
    expected: 200,
  },
];

/**
 * Public on purpose: they have no permission guard and are covered by their own tests.
 * A new route belongs here only if anyone may call it; otherwise add matrix rows.
 */
const PUBLIC_ROUTES = [
  // Better Auth (sign-in, sign-up, OAuth callbacks, 2FA...) enforces its own rules.
  "/api/auth/*",
  "/api/health",
  // The invitation link is the credential: lookup and acceptance by token.
  "/api/invitations/by-token/:token",
  "/api/invitations/by-token/:token/accept",
  // The private OpenAPI document (only registered outside production).
  "/api/openapi.json",
  // The public content API: the site key is the credential. `public.routes.test.ts` covers its 401.
  "/api/public/v1/openapi.json",
  "/api/public/v1/:churchSlug/*",
];

describe("authorization matrix", () => {
  const calls = defineAuthzMatrix("identity", rows, {
    auth: getAuth(),
    fixtures,
    call,
  });

  // Runs last (tests in a file are sequential): every route must have a row that expects 401/403.
  test("every route has a denied row or is explicitly public", () => {
    expect(findUnguardedRoutes(app.routes, calls, PUBLIC_ROUTES)).toEqual([]);
  });
});
