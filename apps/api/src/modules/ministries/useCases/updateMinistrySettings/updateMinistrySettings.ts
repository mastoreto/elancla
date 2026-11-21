import {
  AUDIT_ACTIONS,
  type MinistryListItemDto,
  type MinistrySettingsBody,
  PERMISSIONS,
} from "@ancla/contracts";
import { db, type Prisma } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import { StaleVersionError } from "../../../blog";
import {
  findCategoryRow,
  findMinistryRow,
  type MinistryRow,
  updateSettingsIfVersion,
} from "../../data";
import { InvalidMinistryReferenceError, requireAllScope } from "../../domain";
import { buildMinistryListItems } from "../buildMinistryListItems";

const DESTINATIONS = {
  page: "PAGE",
  external: "EXTERNAL",
  none: "NONE",
} as const;

/** What the audit trail records of the settings: no revisions, no timestamps. */
const settingsOf = (row: MinistryRow) => ({
  version: row.version,
  categoryId: row.categoryId,
  destination: row.destination,
  externalUrl: row.externalUrl,
  icon: row.icon,
  color: row.color,
});

async function assertCategoryUsable(
  tx: Prisma.TransactionClient,
  organizationId: string,
  categoryId: string | null,
): Promise<void> {
  if (categoryId === null) return;
  if (!(await findCategoryRow(tx, organizationId, categoryId))) {
    throw new InvalidMinistryReferenceError(
      "invalid_category",
      "The category does not exist",
    );
  }
}

/** Direct (not editorial) settings of a ministry; `version` is the one the editor loaded. */
export function updateMinistrySettings(
  ctx: AuthenticatedContext,
  id: string,
  { version, ...body }: MinistrySettingsBody,
): Promise<MinistryListItemDto> {
  requireAllScope(ctx.access, PERMISSIONS.ministryProfile.edit);
  return withTransaction(db, async (tx) => {
    const current = await findMinistryRow(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The ministry was not found");
    await assertCategoryUsable(tx, ctx.organizationId, body.categoryId);

    const applied = await updateSettingsIfVersion(
      tx,
      { id, organizationId: ctx.organizationId, version },
      {
        categoryId: body.categoryId,
        destination: DESTINATIONS[body.destination],
        externalUrl: body.destination === "external" ? body.externalUrl : null,
        icon: body.icon,
        color: body.color,
      },
    );
    if (!applied) throw new StaleVersionError();

    const updated = await findMinistryRow(tx, ctx.organizationId, id);
    if (!updated) throw new NotFoundError("The ministry was not found");
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.ministry.settingsUpdated,
      entity: { type: "ministry", id },
      before: settingsOf(current),
      after: settingsOf(updated),
    });
    const [item] = await buildMinistryListItems(ctx.organizationId, [updated]);
    return item as MinistryListItemDto;
  });
}
