import {
  AUDIT_ACTIONS,
  type SeriesDto,
  type UpsertSeriesBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { createSeriesRow, findTakenSeriesSlug } from "../../data";
import { TaxonomySlugTakenError } from "../../domain";
import { toSeriesDto } from "../../mappers";
import { assertTaxonomyLocales } from "../assertTaxonomyLocales";

export function createSeries(
  ctx: AuthenticatedContext,
  body: UpsertSeriesBody,
): Promise<SeriesDto> {
  return withTransaction(db, async (tx) => {
    await assertTaxonomyLocales(tx, ctx.organizationId, body.translations);
    const taken = await findTakenSeriesSlug(tx, {
      organizationId: ctx.organizationId,
      slugs: Object.entries(body.translations).map(([locale, { slug }]) => ({
        locale,
        slug,
      })),
    });
    if (taken) throw new TaxonomySlugTakenError(taken.locale, taken.slug);
    const created = toSeriesDto(
      await createSeriesRow(tx, ctx.organizationId, body),
    );
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.series.created,
      entity: { type: "series", id: created.id },
      after: created,
    });
    return created;
  });
}
