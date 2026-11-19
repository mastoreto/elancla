import type { MinistryDto, Page, PageQuery } from "@ancla/contracts";
import { PERMISSIONS } from "@ancla/contracts";
import { scopeWhere } from "../../../../core/authz";
import type { AuthenticatedContext } from "../../../../core/context";
import { toPage } from "../../../../core/http";
import { listMinistryRows } from "../../data";
import { toMinistryDto } from "../../mappers";

/** A user with the `ministry` scope sees only their own ministries; `all` sees every one. */
export async function listMinistries(
  ctx: AuthenticatedContext,
  query: PageQuery,
): Promise<Page<MinistryDto>> {
  const scope = scopeWhere(ctx, PERMISSIONS.ministryProfile.view, {
    ministryField: "id",
  });
  const page = toPage(
    await listMinistryRows(ctx.organizationId, scope, query),
    query.limit,
  );
  return { items: page.items.map(toMinistryDto), nextCursor: page.nextCursor };
}
