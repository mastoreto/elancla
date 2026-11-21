import {
  AUDIT_ACTIONS,
  type CreateMinistryBody,
  type CreateMinistryResponse,
  PERMISSIONS,
} from "@ancla/contracts";
import { db, type Prisma } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { createMinistryRow, isMinistrySlugTaken } from "../../data";
import { requireAllScope, slugifyMinistryName } from "../../domain";

/** The internal slug of a new ministry: the name's, with a counter when it is taken. */
async function freeInternalSlug(
  tx: Prisma.TransactionClient,
  organizationId: string,
  name: string,
): Promise<string> {
  const base = slugifyMinistryName(name);
  let candidate = base;
  for (
    let counter = 2;
    await isMinistrySlugTaken(tx, organizationId, candidate);
    counter++
  ) {
    candidate = `${base}-${counter}`;
  }
  return candidate;
}

/** An empty ministry: its public profile is written through the editorial workflow. */
export function createMinistry(
  ctx: AuthenticatedContext,
  body: CreateMinistryBody,
): Promise<CreateMinistryResponse> {
  requireAllScope(ctx.access, PERMISSIONS.ministryProfile.create);
  return withTransaction(db, async (tx) => {
    const slug = await freeInternalSlug(tx, ctx.organizationId, body.name);
    const created = await createMinistryRow(tx, ctx.organizationId, {
      name: body.name,
      slug,
    });
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.ministry.created,
      entity: { type: "ministry", id: created.id },
      after: { id: created.id, name: created.name, slug: created.slug },
    });
    return { id: created.id };
  });
}
