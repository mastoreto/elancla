import {
  AUDIT_ACTIONS,
  type UpdateVisitBody,
  type VisitContentDto,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import {
  findOrganizationLocaleConfig,
  findSettingsWithDirections,
  listVisitFaqRows,
  replaceVisitFaqs,
  upsertDirections,
} from "../../data";
import { assertVisitLocales } from "../../domain";
import { toVisitContentDto } from "../../mappers";

/**
 * Saves the visit page content as one unit: the FAQ list is replaced and the directions of the
 * languages sent are written. One audit row carries the whole before and after.
 */
export async function updateVisit(
  ctx: AuthenticatedContext,
  body: UpdateVisitBody,
): Promise<VisitContentDto> {
  return withTransaction(db, async (tx) => {
    const organizationId = ctx.organizationId;
    const organization = await findOrganizationLocaleConfig(tx, organizationId);
    const settings = await findSettingsWithDirections(tx, organizationId);
    if (!organization || !settings) {
      throw new NotFoundError("The site settings were not found");
    }
    assertVisitLocales(body, organization);

    const before = toVisitContentDto(
      settings,
      await listVisitFaqRows(tx, organizationId),
      organization,
    );
    await replaceVisitFaqs(tx, organizationId, body.faqs);
    for (const [locale, directions] of Object.entries(body.directions)) {
      await upsertDirections(tx, {
        siteSettingsId: settings.id,
        locale,
        directions,
      });
    }

    const updated = await findSettingsWithDirections(tx, organizationId);
    if (!updated) throw new NotFoundError("The site settings were not found");
    const after = toVisitContentDto(
      updated,
      await listVisitFaqRows(tx, organizationId),
      organization,
    );
    await writeAudit(tx, auditSourceFrom(ctx, organizationId), {
      action: AUDIT_ACTIONS.visit.updated,
      entity: { type: "visit", id: settings.id },
      before,
      after,
      metadata: { entityLabel: settings.name },
    });
    return after;
  });
}
