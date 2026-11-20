// Mirrors apps/api/src/scripts/seedE2eUsers/e2eUsers.ts (duplicated on purpose: the e2e project
// does not import the API). Keep both in sync.
export const E2E_PASSWORD = "e2e-correct-horse-battery";

export const E2E_USERS = {
  admin: "e2e-admin@example.test",
  treasurer: "e2e-treasurer@example.test",
  noRole: "e2e-norole@example.test",
  twoFactor: "e2e-twofactor@example.test",
  editor: "e2e-editor@example.test",
  reviewer: "e2e-reviewer@example.test",
} as const;

/** Name of the site key seeded from `.env.test` for the public web (see seed:e2e). */
export const E2E_SITE_KEY_NAME = "e2e-seeded-web";

/** Name the reviewer account carries (the settings tab lists people by it). */
export const E2E_REVIEWER_NAME = "E2E Reviewer";
