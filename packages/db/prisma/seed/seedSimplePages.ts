import type { PrismaClient } from "../../src";
import { EL_ANCLA_PRIVACY_PAGE } from "./elAnclaPrivacyPage";

/**
 * Creates the privacy policy as a DRAFT simple page. Idempotent by emptiness: once the
 * organization has any page the seed leaves them alone.
 *
 * A revision needs an author and the seed runs before anybody is invited, so the draft is
 * written under the oldest user that holds a role in the organization. ponytail: on a brand
 * new database the page appears the first time the seed runs after the first admin exists.
 */
export async function seedSimplePages(
  client: PrismaClient,
  organizationId: string,
): Promise<void> {
  const existing = await client.simplePage.count({ where: { organizationId } });
  if (existing > 0) return;

  const author = await client.user.findFirst({
    where: { userRoles: { some: { role: { organizationId } } } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!author) {
    console.info("Simple pages skipped: no user to author the draft yet.");
    return;
  }

  const page = await client.simplePage.create({ data: { organizationId } });
  await client.contentRevision.create({
    data: {
      organizationId,
      contentType: "SIMPLE_PAGE",
      entityId: page.id,
      number: 1,
      state: "DRAFT",
      snapshot: EL_ANCLA_PRIVACY_PAGE,
      authorId: author.id,
    },
  });
}
