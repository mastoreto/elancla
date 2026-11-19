import type { InvitationDto, Page, PageQuery } from "@ancla/contracts";
import type { AuthenticatedContext } from "../../../../../core/context";
import { toPage } from "../../../../../core/http";
import { listInvitationRows } from "../../data";
import { toInvitationDto } from "../../mappers";

export async function listInvitations(
  ctx: AuthenticatedContext,
  query: PageQuery,
): Promise<Page<InvitationDto>> {
  const rows = await listInvitationRows(ctx.organizationId, query);
  const now = new Date();
  const page = toPage(rows, query.limit);
  return {
    items: page.items.map((row) => toInvitationDto(row, now)),
    nextCursor: page.nextCursor,
  };
}
