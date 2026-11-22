import {
  AUDIT_ACTIONS,
  type SiteSettingsDto,
  type UpdateSiteSettingsBody,
} from "@ancla/contracts";
import { db, type Prisma } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError, ValidationError } from "../../../../core/errors";
import {
  findOrganizationLocaleConfig,
  findSiteSettingsRow,
  updateSiteSettingsIfVersion,
  upsertSeoDescription,
} from "../../data";
import { resolveSectionStatuses, StaleVersionError } from "../../domain";
import { toSiteSettingsDto } from "../../mappers";

const STATUSES = {
  online: "ONLINE",
  maintenance: "MAINTENANCE",
  closed: "CLOSED",
} as const;

function assertLocalesAreEnabled(
  translations: UpdateSiteSettingsBody["translations"],
  enabledLocales: readonly string[],
): void {
  const unknown = Object.keys(translations ?? {}).filter(
    (locale) => !enabledLocales.includes(locale),
  );
  if (unknown.length === 0) return;
  throw new ValidationError(
    "Some languages are not enabled for the organization",
    unknown.map((locale) => ({
      path: `translations.${locale}`,
      message: `${locale} is not an enabled language`,
    })),
  );
}

/** Only what the body sent: `undefined` leaves a column as it is. */
function toColumns(
  body: UpdateSiteSettingsBody,
): Prisma.SiteSettingsUncheckedUpdateManyInput {
  const { version: _version, translations: _translations, ...fields } = body;
  const { status, sections, ...plain } = fields;
  return {
    ...plain,
    status: status === undefined ? undefined : STATUSES[status],
    // The map is replaced as a whole; a key left out goes back to `active`.
    sectionStatuses:
      sections === undefined ? undefined : resolveSectionStatuses(sections),
  };
}

export async function updateSiteSettings(
  ctx: AuthenticatedContext,
  body: UpdateSiteSettingsBody,
): Promise<SiteSettingsDto> {
  return withTransaction(db, async (tx) => {
    const organization = await findOrganizationLocaleConfig(
      tx,
      ctx.organizationId,
    );
    const current = await findSiteSettingsRow(tx, ctx.organizationId);
    if (!organization || !current) {
      throw new NotFoundError("The site settings were not found");
    }
    assertLocalesAreEnabled(body.translations, organization.locales);

    const applied = await updateSiteSettingsIfVersion(
      tx,
      {
        id: current.id,
        organizationId: ctx.organizationId,
        version: body.version,
      },
      toColumns(body),
    );
    if (!applied) throw new StaleVersionError();

    for (const [locale, { seoDescription }] of Object.entries(
      body.translations ?? {},
    )) {
      await upsertSeoDescription(tx, {
        siteSettingsId: current.id,
        locale,
        seoDescription,
      });
    }

    const updated = await findSiteSettingsRow(tx, ctx.organizationId);
    if (!updated) throw new NotFoundError("The site settings were not found");
    const before = toSiteSettingsDto(current, organization);
    const after = toSiteSettingsDto(updated, organization);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.site.settingsUpdated,
      entity: { type: "siteSettings", id: current.id },
      before,
      after,
      metadata: { entityLabel: current.name },
    });
    return after;
  });
}
