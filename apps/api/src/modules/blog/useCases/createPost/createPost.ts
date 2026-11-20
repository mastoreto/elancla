import { AUDIT_ACTIONS, type CreatePostResponse } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { createPostRow } from "../../data";

/** An empty post: its content is written through the editorial workflow. */
export function createPost(
  ctx: AuthenticatedContext,
): Promise<CreatePostResponse> {
  return withTransaction(db, async (tx) => {
    const created = await createPostRow(tx, ctx.organizationId);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.post.created,
      entity: { type: "post", id: created.id },
      after: { id: created.id },
    });
    return created;
  });
}
