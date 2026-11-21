import {
  AUDIT_ACTIONS,
  type MinistryLeadersBody,
  type MinistryLeadersDto,
  PERMISSIONS,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import {
  findMinistryRow,
  findPersonProfileIds,
  listLeaderRows,
  replaceLeaderRows,
} from "../../data";
import { InvalidMinistryReferenceError, requireAllScope } from "../../domain";
import { toMinistryLeaderDto } from "../../mappers";
import { assertTranslationLocales } from "../assertTranslationLocales";

/** Replaces the whole list of leaders of one ministry (the people CRM never touches them). */
export function replaceMinistryLeaders(
  ctx: AuthenticatedContext,
  id: string,
  body: MinistryLeadersBody,
): Promise<MinistryLeadersDto> {
  requireAllScope(ctx.access, PERMISSIONS.ministryProfile.edit);
  return withTransaction(db, async (tx) => {
    if (!(await findMinistryRow(tx, ctx.organizationId, id))) {
      throw new NotFoundError("The ministry was not found");
    }
    for (const leader of body) {
      await assertTranslationLocales(
        tx,
        ctx.organizationId,
        leader.translations,
      );
    }
    const known = new Set(
      await findPersonProfileIds(
        tx,
        ctx.organizationId,
        body.map((leader) => leader.personProfileId),
      ),
    );
    if (body.some((leader) => !known.has(leader.personProfileId))) {
      throw new InvalidMinistryReferenceError(
        "invalid_person",
        "Every leader must be a person profile of the organization",
      );
    }

    const before = (await listLeaderRows(tx, id)).map(toMinistryLeaderDto);
    const after = (await replaceLeaderRows(tx, id, body)).map(
      toMinistryLeaderDto,
    );
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.ministry.leadersUpdated,
      entity: { type: "ministry", id },
      before,
      after,
    });
    return { items: after };
  });
}
