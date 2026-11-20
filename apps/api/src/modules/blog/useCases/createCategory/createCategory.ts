import {
  AUDIT_ACTIONS,
  type CategoryDto,
  type UpsertCategoryBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { createCategoryRow, findTakenCategorySlug } from "../../data";
import { TaxonomySlugTakenError } from "../../domain";
import { toCategoryDto } from "../../mappers";
import { assertTaxonomyLocales } from "../assertTaxonomyLocales";

export function createCategory(
  ctx: AuthenticatedContext,
  body: UpsertCategoryBody,
): Promise<CategoryDto> {
  return withTransaction(db, async (tx) => {
    await assertTaxonomyLocales(tx, ctx.organizationId, body.translations);
    const taken = await findTakenCategorySlug(tx, {
      organizationId: ctx.organizationId,
      slugs: Object.entries(body.translations).map(([locale, { slug }]) => ({
        locale,
        slug,
      })),
    });
    if (taken) throw new TaxonomySlugTakenError(taken.locale, taken.slug);
    const created = toCategoryDto(
      await createCategoryRow(tx, ctx.organizationId, body),
    );
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.category.created,
      entity: { type: "category", id: created.id },
      after: created,
    });
    return created;
  });
}
