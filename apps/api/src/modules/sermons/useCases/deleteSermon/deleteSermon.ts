import { AUDIT_ACTIONS } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import {
  changeRevision,
  findLiveRevision,
  findWorkingRevision,
} from "../../../editorial";
import {
  deleteSermonLinks,
  deleteSermonRow,
  findSermonRow,
  listSermonLinks,
} from "../../data";
import { SermonLiveError } from "../../domain";

/**
 * Deletes a sermon that is not live. One with a live revision (published or paused) is already
 * known to the public site, so it is refused (409 `sermon_live`). A draft left behind is retired
 * (`SUPERSEDED`), so it never reaches the inbox of a row that no longer exists; the history is
 * not deleted. Its video link goes too, which frees the video: a sermon's video is its identity,
 * so the way to change it is to delete the sermon and create another.
 */
export function deleteSermon(
  ctx: AuthenticatedContext,
  id: string,
): Promise<void> {
  return withTransaction(db, async (tx) => {
    const current = await findSermonRow(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The sermon was not found");
    const key = {
      organizationId: ctx.organizationId,
      contentType: "SERMON",
      entityId: id,
    } as const;
    if (await findLiveRevision(tx, key)) throw new SermonLiveError();

    const working = await findWorkingRevision(tx, key);
    if (working) {
      await changeRevision(tx, {
        organizationId: ctx.organizationId,
        id: working.id,
        from: [working.state],
        data: { state: "SUPERSEDED" },
      });
    }
    const link = (await listSermonLinks(ctx.organizationId, [id])).get(id);
    await deleteSermonLinks(tx, ctx.organizationId, id);
    await deleteSermonRow(tx, ctx.organizationId, id);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.sermon.deleted,
      entity: { type: "sermon", id },
      before: { id, videoId: link?.externalId ?? null },
    });
  });
}
