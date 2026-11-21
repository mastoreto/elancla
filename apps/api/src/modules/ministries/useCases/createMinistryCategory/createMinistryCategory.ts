import {
  AUDIT_ACTIONS,
  type MinistryCategoryDto,
  PERMISSIONS,
  type UpsertMinistryCategoryBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { createCategoryRow } from "../../data";
import { requireAllScope } from "../../domain";
import { toMinistryCategoryDto } from "../../mappers";
import { assertTranslationLocales } from "../assertTranslationLocales";

export function createMinistryCategory(
  ctx: AuthenticatedContext,
  body: UpsertMinistryCategoryBody,
): Promise<MinistryCategoryDto> {
  requireAllScope(ctx.access, PERMISSIONS.ministryProfile.edit);
  return withTransaction(db, async (tx) => {
    await assertTranslationLocales(tx, ctx.organizationId, body.translations);
    const created = toMinistryCategoryDto(
      await createCategoryRow(tx, ctx.organizationId, body),
    );
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.ministryCategory.created,
      entity: { type: "ministryCategory", id: created.id },
      after: created,
    });
    return created;
  });
}
