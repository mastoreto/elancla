import { db } from "@ancla/db";
import { sha256Hex } from "../../../core/crypto";
import { withTransaction } from "../../../core/db";
import { parseSiteKey } from "../../../modules/siteKeys";

/** The name the CRM lists this key under; the site-keys spec never revokes it. */
export const E2E_SITE_KEY_NAME = "e2e-seeded-web";

/**
 * Makes the key in `SITE_API_KEY` (a fixed, non-secret value of `.env.test`) valid and active in
 * the test database, so the web server started by Playwright can read the public API. The row
 * is upserted by id and its revocation cleared, so it is idempotent and heals a previous run.
 */
export async function ensureE2eSiteKey(
  organizationId: string,
  rawKey: string | undefined,
): Promise<void> {
  const parsed = rawKey ? parseSiteKey(rawKey) : null;
  if (!parsed) {
    throw new Error(
      "SITE_API_KEY in .env.test is missing or not a valid site key (sk_<uuid>_<secret>).",
    );
  }
  const secretHash = sha256Hex(parsed.secret);
  await withTransaction(db, (tx) =>
    tx.siteApiKey.upsert({
      where: { id: parsed.id },
      create: {
        id: parsed.id,
        organizationId,
        name: E2E_SITE_KEY_NAME,
        secretHash,
        createdById: null,
      },
      update: { name: E2E_SITE_KEY_NAME, secretHash, revokedAt: null },
    }),
  );
}
