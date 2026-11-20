import {
  AUDIT_ACTIONS,
  type EditorialSettingsDto,
  type UpdateEditorialSettingsBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { ValidationError, type ValidationIssue } from "../../../../core/errors";
import {
  findExistingRoleIds,
  findExistingUserIds,
  findReviewSettings,
  upsertSettingsRow,
} from "../../data";
import type { EditorialTypeDefinition } from "../../registry";
import { toSettingsDto } from "../getEditorialSettings";

interface UpdateEditorialSettingsInput {
  ctx: AuthenticatedContext;
  definition: EditorialTypeDefinition;
  body: UpdateEditorialSettingsBody;
}

const unique = (ids: string[]): string[] => [...new Set(ids)];

async function unknownIds(
  field: keyof UpdateEditorialSettingsBody,
  ids: string[],
  find: (ids: string[]) => Promise<string[]>,
): Promise<ValidationIssue[]> {
  const known = await find(ids);
  return ids
    .filter((id) => !known.includes(id))
    .map((id) => ({
      path: field,
      message: `${id} does not belong to the organization`,
    }));
}

async function assertIdsBelongToOrganization(
  organizationId: string,
  body: UpdateEditorialSettingsBody,
): Promise<void> {
  const roles = (ids: string[]) => findExistingRoleIds(organizationId, ids);
  const issues = (
    await Promise.all([
      unknownIds("reviewerRoleIds", body.reviewerRoleIds, roles),
      unknownIds("mandatoryReviewRoleIds", body.mandatoryReviewRoleIds, roles),
      unknownIds("reviewerUserIds", body.reviewerUserIds, findExistingUserIds),
      unknownIds(
        "mandatoryReviewUserIds",
        body.mandatoryReviewUserIds,
        findExistingUserIds,
      ),
    ])
  ).flat();
  if (issues.length > 0)
    throw new ValidationError("Unknown roles or users", issues);
}

export async function updateEditorialSettings({
  ctx,
  definition,
  body,
}: UpdateEditorialSettingsInput): Promise<EditorialSettingsDto> {
  const clean: UpdateEditorialSettingsBody = {
    reviewerRoleIds: unique(body.reviewerRoleIds),
    reviewerUserIds: unique(body.reviewerUserIds),
    mandatoryReviewRoleIds: unique(body.mandatoryReviewRoleIds),
    mandatoryReviewUserIds: unique(body.mandatoryReviewUserIds),
  };
  await assertIdsBelongToOrganization(ctx.organizationId, clean);

  return withTransaction(db, async (tx) => {
    const before = await toSettingsDto(
      ctx.organizationId,
      definition.contentType,
      await findReviewSettings(tx, ctx.organizationId, definition.contentType),
    );
    const row = await upsertSettingsRow(
      tx,
      ctx.organizationId,
      definition.contentType,
      clean,
    );
    const after = await toSettingsDto(
      ctx.organizationId,
      definition.contentType,
      row,
    );
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.editorial.settingsUpdated,
      entity: { type: "editorialSettings", id: row.id },
      before,
      after,
      metadata: { contentType: definition.param },
    });
    return after;
  });
}
