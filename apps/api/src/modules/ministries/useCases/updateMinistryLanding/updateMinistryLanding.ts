import {
  AUDIT_ACTIONS,
  type MinistryLandingBody,
  type MinistryListDto,
  PERMISSIONS,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import { assertMediaValid } from "../../../editorial";
import {
  findMinistryIds,
  listOrganizationMinistryRows,
  type MinistryRow,
  updateLandingRows,
} from "../../data";
import { requireAllScope } from "../../domain";
import { buildMinistryListItems } from "../buildMinistryListItems";

/** What the audit trail records of the mosaic: one entry per ministry. */
const landingOf = (row: MinistryRow) => ({
  id: row.id,
  showOnLanding: row.showOnLanding,
  landingOrder: row.landingOrder,
  landingTile: row.landingTile,
  landingTone: row.landingTone,
  landingPhotoId: row.landingPhotoId,
});

/** The landing mosaic, direct (not editorial): every tile in one transaction. */
export function updateMinistryLanding(
  ctx: AuthenticatedContext,
  body: MinistryLandingBody,
): Promise<MinistryListDto> {
  requireAllScope(ctx.access, PERMISSIONS.ministryProfile.edit);
  return withTransaction(db, async (tx) => {
    const ids = body.map((tile) => tile.id);
    const known = await findMinistryIds(tx, ctx.organizationId, ids);
    if (known.length !== ids.length) {
      throw new NotFoundError("A ministry of the mosaic was not found");
    }
    await assertMediaValid(
      { tx, organizationId: ctx.organizationId },
      body.flatMap((tile) =>
        tile.landingPhotoId === null ? [] : [tile.landingPhotoId],
      ),
      "The mosaic photos must be finished content images of the organization",
    );

    const before = (
      await listOrganizationMinistryRows(tx, ctx.organizationId)
    ).filter((row) => ids.includes(row.id));
    await updateLandingRows(tx, ctx.organizationId, body);
    const all = await listOrganizationMinistryRows(tx, ctx.organizationId);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.ministry.landingUpdated,
      before: before.map(landingOf),
      after: all.filter((row) => ids.includes(row.id)).map(landingOf),
    });
    return { items: await buildMinistryListItems(ctx.organizationId, all) };
  });
}
