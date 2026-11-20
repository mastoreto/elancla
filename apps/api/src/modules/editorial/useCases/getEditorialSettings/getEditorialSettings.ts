import type { EditorialSettingsDto } from "@ancla/contracts";
import type { EditorialContentType } from "@ancla/db";
import {
  findExistingRoleIds,
  findExistingUserIds,
  listSettingsRows,
} from "../../data";
import type { ReviewSettings } from "../../domain";
import { EDITORIAL_CONTENT_TYPE_LIST, editorialTypeOf } from "../../registry";

/** Keeps the ids that still match a role of the organization or a user; a deleted one is dropped. */
export async function toSettingsDto(
  organizationId: string,
  contentType: EditorialContentType,
  settings: ReviewSettings,
): Promise<EditorialSettingsDto> {
  const [roleIds, userIds] = await Promise.all([
    findExistingRoleIds(organizationId, [
      ...settings.reviewerRoleIds,
      ...settings.mandatoryReviewRoleIds,
    ]),
    findExistingUserIds([
      ...settings.reviewerUserIds,
      ...settings.mandatoryReviewUserIds,
    ]),
  ]);
  const only = (ids: readonly string[], known: string[]): string[] =>
    ids.filter((id) => known.includes(id));
  return {
    contentType: editorialTypeOf(contentType).param,
    reviewerRoleIds: only(settings.reviewerRoleIds, roleIds),
    reviewerUserIds: only(settings.reviewerUserIds, userIds),
    mandatoryReviewRoleIds: only(settings.mandatoryReviewRoleIds, roleIds),
    mandatoryReviewUserIds: only(settings.mandatoryReviewUserIds, userIds),
  };
}

const EMPTY: ReviewSettings = {
  reviewerRoleIds: [],
  reviewerUserIds: [],
  mandatoryReviewRoleIds: [],
  mandatoryReviewUserIds: [],
};

/** One entry per registered content type, configured or not. */
export async function getEditorialSettings(
  organizationId: string,
): Promise<EditorialSettingsDto[]> {
  const rows = await listSettingsRows(organizationId);
  return Promise.all(
    EDITORIAL_CONTENT_TYPE_LIST.map((definition) =>
      toSettingsDto(
        organizationId,
        definition.contentType,
        rows.find((row) => row.contentType === definition.contentType) ?? EMPTY,
      ),
    ),
  );
}
