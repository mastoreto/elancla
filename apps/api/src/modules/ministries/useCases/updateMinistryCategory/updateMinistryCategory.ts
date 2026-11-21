import {
  AUDIT_ACTIONS,
  type MinistryCategoryDto,
  PERMISSIONS,
  type UpdateMinistryCategoryBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import { StaleVersionError } from "../../../blog";
import { findCategoryRow, replaceCategoryIfVersion } from "../../data";
import { requireAllScope } from "../../domain";
import { toMinistryCategoryDto } from "../../mappers";
import { assertTranslationLocales } from "../assertTranslationLocales";

/** Replaces the order and the translations; `version` is the one the editor loaded. */
export function updateMinistryCategory(
  ctx: AuthenticatedContext,
  id: string,
  { version, ...body }: UpdateMinistryCategoryBody,
): Promise<MinistryCategoryDto> {
  requireAllScope(ctx.access, PERMISSIONS.ministryProfile.edit);
  return withTransaction(db, async (tx) => {
    const current = await findCategoryRow(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The category was not found");
    await assertTranslationLocales(tx, ctx.organizationId, body.translations);

    const applied = await replaceCategoryIfVersion(
      tx,
      { id, organizationId: ctx.organizationId, version },
      body,
    );
    if (!applied) throw new StaleVersionError();

    const updated = await findCategoryRow(tx, ctx.organizationId, id);
    if (!updated) throw new NotFoundError("The category was not found");
    const after = toMinistryCategoryDto(updated);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.ministryCategory.updated,
      entity: { type: "ministryCategory", id },
      before: toMinistryCategoryDto(current),
      after,
    });
    return after;
  });
}
