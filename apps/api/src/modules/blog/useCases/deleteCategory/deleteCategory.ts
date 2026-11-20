import { AUDIT_ACTIONS, type BlogPostSnapshot } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import { listLiveSnapshots } from "../../../editorial";
import { findCategoryRow, softDeleteCategory } from "../../data";
import { TaxonomyInUseError } from "../../domain";
import { toCategoryDto } from "../../mappers";

/** Logical delete. A category a live post points at cannot go (409 `category_in_use`). */
export function deleteCategory(
  ctx: AuthenticatedContext,
  id: string,
): Promise<void> {
  return withTransaction(db, async (tx) => {
    const current = await findCategoryRow(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The category was not found");
    const live = await listLiveSnapshots(ctx.organizationId, "BLOG_POST");
    // ponytail: in-memory scan, same as the public reads.
    const inUse = live.some(
      ({ snapshot }) =>
        (snapshot as unknown as BlogPostSnapshot).categoryId === id,
    );
    if (inUse) {
      throw new TaxonomyInUseError(
        "category_in_use",
        "A published post uses this category; move it to another one first",
      );
    }
    await softDeleteCategory(tx, ctx.organizationId, id);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.category.deleted,
      entity: { type: "category", id },
      before: toCategoryDto(current),
    });
  });
}
