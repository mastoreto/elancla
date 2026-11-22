import { AUDIT_ACTIONS } from "@ancla/contracts";
import type { Prisma } from "@ancla/db";
import { findLiveRevision, findWorkingRevision } from "../../data";
import {
  auditTransition,
  beforeGoLive,
  type EditorialInput,
  entityKeyOf,
  moveRevision,
  retireLive,
} from "../editorialState";

/**
 * Takes the working revision of an entity live inside a transaction the caller owns; `false` when
 * there is none. It is the go-live primitive of `publish` without the review rule: the caller is
 * an act that approves by itself (publishing a whole calendar year), so it decides who may do it.
 * The type's `beforeGoLive` still runs and refuses what cannot go live.
 */
export async function goLiveWorkingRevision(
  tx: Prisma.TransactionClient,
  input: EditorialInput,
  metadata: Record<string, unknown> = {},
): Promise<boolean> {
  const key = entityKeyOf(input);
  const working = await findWorkingRevision(tx, key);
  if (!working) return false;
  const live = await findLiveRevision(tx, key);

  await beforeGoLive(tx, input, working);
  await retireLive(tx, input.ctx.organizationId, live);
  const published = await moveRevision(tx, {
    organizationId: input.ctx.organizationId,
    revision: working,
    from: working.state,
    data: { state: "PUBLISHED", publishedAt: new Date() },
  });
  await auditTransition(tx, input, {
    action: AUDIT_ACTIONS.editorial.published,
    before: working,
    after: published,
    metadata: {
      ...metadata,
      ...(live ? { supersededRevisionId: live.id } : {}),
    },
  });
  return true;
}
