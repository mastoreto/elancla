import { AUDIT_ACTIONS, PERMISSIONS } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import {
  findCategoryRow,
  isCategoryInUse,
  softDeleteCategory,
} from "../../data";
import { MinistryCategoryInUseError, requireAllScope } from "../../domain";
import { toMinistryCategoryDto } from "../../mappers";

/** Logical delete. A category a ministry points at cannot go (409 `category_in_use`). */
export function deleteMinistryCategory(
  ctx: AuthenticatedContext,
  id: string,
): Promise<void> {
  requireAllScope(ctx.access, PERMISSIONS.ministryProfile.edit);
  return withTransaction(db, async (tx) => {
    const current = await findCategoryRow(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The category was not found");
    if (await isCategoryInUse(tx, ctx.organizationId, id)) {
      throw new MinistryCategoryInUseError();
    }
    await softDeleteCategory(tx, ctx.organizationId, id);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.ministryCategory.deleted,
      entity: { type: "ministryCategory", id },
      before: toMinistryCategoryDto(current),
    });
  });
}
