/**
 * Accounts the Playwright suite signs in with. The CRM mirrors these emails and the password in
 * apps/crm/e2e/support/users.ts (duplicated on purpose: the e2e project does not import the API).
 */
export const E2E_PASSWORD = "e2e-correct-horse-battery";

export interface E2eUser {
  email: string;
  name: string;
  /** Seeded role key; `null` creates an account with no role at all. */
  roleKey: string | null;
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
];
