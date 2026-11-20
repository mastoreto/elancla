import type { SiteSettingsDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import { NotFoundError } from "../../../../core/errors";
import { findOrganizationLocaleConfig, findSiteSettingsRow } from "../../data";
import { toSiteSettingsDto } from "../../mappers";

export async function getSiteSettings(
  organizationId: string,
): Promise<SiteSettingsDto> {
  const [organization, settings] = await Promise.all([
    findOrganizationLocaleConfig(db, organizationId),
    findSiteSettingsRow(db, organizationId),
  ]);
  if (!organization || !settings) {
    throw new NotFoundError("The site settings were not found");
  }
  return toSiteSettingsDto(settings, organization);
}
