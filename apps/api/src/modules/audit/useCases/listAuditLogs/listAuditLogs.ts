import type { AuditListQuery, AuditLogDto, Page } from "@ancla/contracts";
import type { AuthenticatedContext } from "../../../../core/context";
import { toPage } from "../../../../core/http";
import { listAuditRows } from "../../data";
import { toAuditLogDto } from "../../mappers";

/** Reading the trail is not itself audited: it would only fill the log with its own reads. */
export async function listAuditLogs(
  ctx: AuthenticatedContext,
  query: AuditListQuery,
): Promise<Page<AuditLogDto>> {
  const page = toPage(
    await listAuditRows(ctx.organizationId, query),
    query.limit,
  );
  return { items: page.items.map(toAuditLogDto), nextCursor: page.nextCursor };
}
