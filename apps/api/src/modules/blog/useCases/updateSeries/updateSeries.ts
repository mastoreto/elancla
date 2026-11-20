import {
  AUDIT_ACTIONS,
  type SeriesDto,
  type UpdateSeriesBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import {
  findSeriesRow,
  findTakenSeriesSlug,
  replaceSeriesIfVersion,
} from "../../data";
import { StaleVersionError, TaxonomySlugTakenError } from "../../domain";
import { toSeriesDto } from "../../mappers";
import { assertTaxonomyLocales } from "../assertTaxonomyLocales";

/** Replaces the translations; `version` is the one the editor loaded. */
export function updateSeries(
  ctx: AuthenticatedContext,
  id: string,
  { version, ...body }: UpdateSeriesBody,
): Promise<SeriesDto> {
  return withTransaction(db, async (tx) => {
    const current = await findSeriesRow(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The series was not found");
    await assertTaxonomyLocales(tx, ctx.organizationId, body.translations);
    const taken = await findTakenSeriesSlug(tx, {
      organizationId: ctx.organizationId,
      slugs: Object.entries(body.translations).map(([locale, { slug }]) => ({
        locale,
        slug,
      })),
      exceptId: id,
    });
    if (taken) throw new TaxonomySlugTakenError(taken.locale, taken.slug);

    const applied = await replaceSeriesIfVersion(
      tx,
      { id, organizationId: ctx.organizationId, version },
      body,
    );
    if (!applied) throw new StaleVersionError();

    const updated = await findSeriesRow(tx, ctx.organizationId, id);
    if (!updated) throw new NotFoundError("The series was not found");
    const after = toSeriesDto(updated);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.series.updated,
      entity: { type: "series", id },
      before: toSeriesDto(current),
      after,
    });
    return after;
  });
}
