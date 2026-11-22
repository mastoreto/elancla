import { describe, expect, test } from "bun:test";
import {
  PERMISSIONS,
  type Permission,
  type PermissionScope,
} from "@ancla/contracts";
import type { Access } from "../../../../../core/context";
import { canSeeEvent } from "./canSeeEvent";

const AUDIENCE_ROLE = "0197f1a0-0000-7000-8000-000000000001";
const OTHER_ROLE = "0197f1a0-0000-7000-8000-000000000002";

function accessOf(options: {
  isAdmin?: boolean;
  roleIds?: string[];
  canViewInternal?: boolean;
}): Access {
  const grants = new Map<Permission, PermissionScope>(
    options.canViewInternal ? [[PERMISSIONS.calendarInternal.view, "all"]] : [],
  );
  return {
    isAdmin: options.isAdmin ?? false,
    roles: (options.roleIds ?? []).map(
      (id) => ({ id }) as Access["roles"][number],
    ),
    grants,
    ministryIds: [],
    sessionPolicy: { persistent: true, maxSessionSeconds: null },
  };
}

const internal = {
  visibility: "INTERNAL",
  audienceRoleIds: [AUDIENCE_ROLE],
} as const;

describe("canSeeEvent", () => {
  test("everyone sees a public event", () => {
    const event = { visibility: "PUBLIC", audienceRoleIds: [] } as const;
    expect(canSeeEvent(accessOf({}), event)).toBe(true);
  });

  test("the admin sees every internal event", () => {
    expect(canSeeEvent(accessOf({ isAdmin: true }), internal)).toBe(true);
  });

  test("an internal event needs the permission and a role of its audience", () => {
    const member = accessOf({
      roleIds: [AUDIENCE_ROLE],
      canViewInternal: true,
    });
    expect(canSeeEvent(member, internal)).toBe(true);
    const outsider = accessOf({
      roleIds: [OTHER_ROLE],
      canViewInternal: true,
    });
    expect(canSeeEvent(outsider, internal)).toBe(false);
    const noPermission = accessOf({ roleIds: [AUDIENCE_ROLE] });
    expect(canSeeEvent(noPermission, internal)).toBe(false);
  });

  test("an internal event with no audience is for the admin only", () => {
    const event = { visibility: "INTERNAL", audienceRoleIds: [] } as const;
    const member = accessOf({
      roleIds: [AUDIENCE_ROLE],
      canViewInternal: true,
    });
    expect(canSeeEvent(member, event)).toBe(false);
  });
});
