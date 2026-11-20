import {
  AUDIT_ACTIONS,
  type CategoryDto,
  type UpdateCategoryBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import {
  findCategoryRow,
  findTakenCategorySlug,
  replaceCategoryIfVersion,
} from "../../data";
import { StaleVersionError, TaxonomySlugTakenError } from "../../domain";
import { toCategoryDto } from "../../mappers";
import { assertTaxonomyLocales } from "../assertTaxonomyLocales";

/** Replaces the order and the translations; `version` is the one the editor loaded. */
export function updateCategory(
  ctx: AuthenticatedContext,
  id: string,
  { version, ...body }: UpdateCategoryBody,
): Promise<CategoryDto> {
  return withTransaction(db, async (tx) => {
    const current = await findCategoryRow(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The category was not found");
    await assertTaxonomyLocales(tx, ctx.organizationId, body.translations);
    const taken = await findTakenCategorySlug(tx, {
      organizationId: ctx.organizationId,
      slugs: Object.entries(body.translations).map(([locale, { slug }]) => ({
        locale,
        slug,
      })),
      exceptId: id,
    });
    if (taken) throw new TaxonomySlugTakenError(taken.locale, taken.slug);

    const applied = await replaceCategoryIfVersion(
      tx,
      { id, organizationId: ctx.organizationId, version },
      body,
    );
    if (!applied) throw new StaleVersionError();

    const updated = await findCategoryRow(tx, ctx.organizationId, id);
    if (!updated) throw new NotFoundError("The category was not found");
    const after = toCategoryDto(updated);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.category.updated,
      entity: { type: "category", id },
      before: toCategoryDto(current),
      after,
    });
    return after;
  });
}
