import {
  AUDIT_ACTIONS,
  type CreatedSiteKeyDto,
  type CreateSiteKeyBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { type AuditSource, writeAudit } from "../../../../core/audit";
import { sha256Hex } from "../../../../core/crypto";
import { withTransaction } from "../../../../core/db";
import {
  countActiveSiteKeyRows,
  createSiteKeyRow,
  lockOrganizationKeys,
} from "../../data";
import {
  formatSiteKey,
  generateSiteKeySecret,
  hasReachedSiteKeyLimit,
  SiteKeyLimitError,
} from "../../domain";
import { toSiteKeyDto } from "../../mappers";

export interface CreateSiteKeyInput {
  organizationId: string;
  body: CreateSiteKeyBody;
  /** The user creating the key; `null` when a script does. */
  createdById: string | null;
  audit: AuditSource;
}

/**
 * Creates a key and returns it with its plain text: the only moment the secret exists on the
 * server (only its SHA-256 is stored). The count and the insert share one transaction.
 */
export async function createSiteKey(
  input: CreateSiteKeyInput,
): Promise<CreatedSiteKeyDto> {
  const secret = generateSiteKeySecret();
  const created = await withTransaction(db, async (tx) => {
    await lockOrganizationKeys(tx, input.organizationId);
    if (
      hasReachedSiteKeyLimit(
        await countActiveSiteKeyRows(tx, input.organizationId),
      )
    ) {
      throw new SiteKeyLimitError();
    }
    const row = await createSiteKeyRow(tx, {
      organizationId: input.organizationId,
      name: input.body.name,
      secretHash: sha256Hex(secret),
      createdById: input.createdById,
    });
    await writeAudit(tx, input.audit, {
      action: AUDIT_ACTIONS.siteApiKey.created,
      entity: { type: "siteApiKey", id: row.id },
      after: toSiteKeyDto(row),
      metadata: { entityLabel: row.name },
    });
    return row;
  });
  return { ...toSiteKeyDto(created), key: formatSiteKey(created.id, secret) };
}
