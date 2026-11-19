// Mirrors apps/api/src/scripts/seedE2eUsers/e2eUsers.ts (duplicated on purpose: the e2e project
// does not import the API). Keep both in sync.
export const E2E_PASSWORD = "e2e-correct-horse-battery";

export const E2E_USERS = {
  admin: "e2e-admin@example.test",
  treasurer: "e2e-treasurer@example.test",
  noRole: "e2e-norole@example.test",
  twoFactor: "e2e-twofactor@example.test",
} as const;
