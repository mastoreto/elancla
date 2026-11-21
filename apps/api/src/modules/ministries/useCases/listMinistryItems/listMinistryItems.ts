import { type MinistryListDto, PERMISSIONS } from "@ancla/contracts";
import { scopeWhere } from "../../../../core/authz";
import type { AuthenticatedContext } from "../../../../core/context";
import { listMinistrySettingsRows } from "../../data";
import { buildMinistryListItems } from "../buildMinistryListItems";

/** The ministries with their settings and editorial state; a ministry scope sees only its own. */
export async function listMinistryItems(
  ctx: AuthenticatedContext,
): Promise<MinistryListDto> {
  const scope = scopeWhere(ctx, PERMISSIONS.ministryProfile.view, {
    ministryField: "id",
  });
  const rows = await listMinistrySettingsRows(ctx.organizationId, scope);
  return { items: await buildMinistryListItems(ctx.organizationId, rows) };
}
