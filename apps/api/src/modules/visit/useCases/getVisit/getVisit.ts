import type { VisitContentDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import { NotFoundError } from "../../../../core/errors";
import {
  findOrganizationLocaleConfig,
  findSettingsWithDirections,
  listVisitFaqRows,
} from "../../data";
import { toVisitContentDto } from "../../mappers";

export async function getVisit(
  organizationId: string,
): Promise<VisitContentDto> {
  const [organization, settings, faqs] = await Promise.all([
    findOrganizationLocaleConfig(db, organizationId),
    findSettingsWithDirections(db, organizationId),
    listVisitFaqRows(db, organizationId),
  ]);
  if (!organization || !settings) {
    throw new NotFoundError("The site settings were not found");
  }
  return toVisitContentDto(settings, faqs, organization);
}
