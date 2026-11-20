import { grant, PERMISSIONS, type PermissionGrant } from "@ancla/contracts";

/**
 * Accounts the Playwright suite signs in with. The CRM mirrors these emails and the password in
 * apps/crm/e2e/support/users.ts (duplicated on purpose: the e2e project does not import the API).
 */
export const E2E_PASSWORD = "e2e-correct-horse-battery";

/** A role created for the suite when no seeded role fits, found again by its name. */
export interface E2eCustomRole {
  name: string;
  grants: PermissionGrant[];
}

export interface E2eUser {
  email: string;
  name: string;
  /** Seeded role key; `null` creates an account with no role at all. */
  roleKey: string | null;
  /** Used instead of `roleKey` when set. */
  customRole?: E2eCustomRole;
  /** The two-factor spec turns 2FA on, so the seed switches it off again on every run. */
  resetTwoFactor?: boolean;
}

export const E2E_USERS: readonly E2eUser[] = [
  { email: "e2e-admin@example.test", name: "E2E Admin", roleKey: "admin" },
  {
    email: "e2e-treasurer@example.test",
    name: "E2E Treasurer",
    roleKey: "treasurer",
  },
  { email: "e2e-norole@example.test", name: "E2E Without Role", roleKey: null },
  {
    email: "e2e-twofactor@example.test",
    name: "E2E Two Factor",
    roleKey: "treasurer",
    resetTwoFactor: true,
  },
  {
    email: "e2e-editor@example.test",
    name: "E2E Editor",
    roleKey: "content-editor",
  },
  {
    // Reads ministry profiles but cannot publish: reviews only because editorial settings say so.
    email: "e2e-reviewer@example.test",
    name: "E2E Reviewer",
    roleKey: null,
    customRole: {
      name: "E2E Reviewer",
      grants: [
        grant(PERMISSIONS.blogPosts.view),
        grant(PERMISSIONS.blogPosts.edit),
        grant(PERMISSIONS.ministryProfile.view),
        grant(PERMISSIONS.ministryProfile.edit),
      ],
    },
  },
];
