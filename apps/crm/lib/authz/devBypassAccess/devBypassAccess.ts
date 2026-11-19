import type { MePermissionsDto } from "@ancla/contracts";

/** Without a session (development bypass) the screens must still render: full access, no roles. */
export const DEV_BYPASS_ACCESS: MePermissionsDto = {
  isAdmin: true,
  roles: [],
  grants: [],
  ministryIds: [],
};
