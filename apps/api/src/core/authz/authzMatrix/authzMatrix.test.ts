import { afterAll, describe } from "bun:test";
import { createApiCaller } from "../../../../test/support/apiCaller";
import {
  defineAuthzMatrix,
  grant,
  type MatrixRow,
} from "../../../../test/support/authzMatrix";
import { createFixtures } from "../../../../test/support/fixtures";
import { getAuth } from "../../auth";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);
const UNKNOWN_ID = "01900000-0000-7000-8000-000000000000";

afterAll(() => fixtures.cleanup());

const NOTHING = [] as const;
const validRole = { name: "x", grants: [] };

/** Each row proves the guard: 401/403 when stopped, anything else (200/400/404) when let through. */
const rows: MatrixRow[] = [
  // Not signed in.
  ...(
    [
      "/roles",
      "/users",
      "/ministries",
      "/invitations",
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

  // roles:*, one action at a time.
  {
    who: "roles:view",
    caller: [grant("roles", "view")],
    method: "GET",
    path: "/roles",
    expected: 200,
  },
  {
    who: "roles:view",
    caller: [grant("roles", "view")],
    method: "GET",
    path: `/roles/${UNKNOWN_ID}`,
    expected: 404,
  },
  {
    who: "roles:view",
    caller: [grant("roles", "view")],
    method: "POST",
    path: "/roles",
    body: validRole,
    expected: 403,
  },
  {
    who: "roles:view",
    caller: [grant("roles", "view")],
    method: "PATCH",
    path: `/roles/${UNKNOWN_ID}`,
    body: validRole,
    expected: 403,
  },
  {
    who: "roles:view",
    caller: [grant("roles", "view")],
    method: "DELETE",
    path: `/roles/${UNKNOWN_ID}`,
    expected: 403,
  },
  {
    who: "roles:create",
    caller: [grant("roles", "create")],
    method: "POST",
    path: "/roles",
    body: {},
    expected: 400,
  },
  {
    who: "roles:edit",
    caller: [grant("roles", "edit")],
    method: "PATCH",
    path: `/roles/${UNKNOWN_ID}`,
    body: validRole,
    expected: 403,
  },
  {
    who: "roles:delete",
    caller: [grant("roles", "delete")],
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
    who: "users:view",
    caller: [grant("users", "view")],
    method: "GET",
    path: "/users",
    expected: 200,
  },
  {
    who: "users:view",
    caller: [grant("users", "view")],
    method: "PUT",
    path: `/users/${UNKNOWN_ID}/roles`,
    body: { roleIds: [] },
    expected: 403,
  },
  {
    who: "users:edit",
    caller: [grant("users", "edit")],
    method: "PUT",
    path: `/users/${UNKNOWN_ID}/roles`,
    body: { roleIds: [] },
    expected: 404,
  },
  {
    who: "users:edit",
    caller: [grant("users", "edit")],
    method: "PUT",
    path: `/users/${UNKNOWN_ID}/ministries`,
    body: { ministryIds: [] },
    expected: 404,
  },
  {
    who: "users:edit",
    caller: [grant("users", "edit")],
    method: "GET",
    path: "/users",
    expected: 403,
  },

  // ministries: any scope on profile:view lets the call in; the scope filters the data.
  {
    who: "ministries.profile:view (ministry)",
    caller: [grant("ministries.profile", "view", "ministry")],
    method: "GET",
    path: "/ministries",
    expected: 200,
  },
  {
    who: "ministries.finance:view",
    caller: [grant("ministries.finance", "view", "all")],
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
    who: "invitations:view",
    caller: [grant("invitations", "view")],
    method: "GET",
    path: "/invitations",
    expected: 200,
  },
  {
    who: "invitations:view",
    caller: [grant("invitations", "view")],
    method: "POST",
    path: "/invitations",
    body: {},
    expected: 403,
  },
  {
    who: "invitations:create",
    caller: [grant("invitations", "create")],
    method: "POST",
    path: "/invitations",
    body: {},
    expected: 400,
  },
  {
    who: "invitations:delete",
    caller: [grant("invitations", "delete")],
    method: "POST",
    path: `/invitations/${UNKNOWN_ID}/revoke`,
    expected: 404,
  },
  {
    who: "invitations:create",
    caller: [grant("invitations", "create")],
    method: "POST",
    path: `/invitations/${UNKNOWN_ID}/revoke`,
    expected: 403,
  },

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

describe("authorization matrix", () => {
  defineAuthzMatrix("identity", rows, { auth: getAuth(), fixtures, call });
});
