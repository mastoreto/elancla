import {
  AUDIT_ACTIONS,
  type EditorialStatusDto,
  type SaveDraftBody,
} from "@ancla/contracts";
import { db, type Prisma } from "@ancla/db";
import { withTransaction } from "../../../../core/db";
import { ValidationError } from "../../../../core/errors";
import { createDraftRevision, nextRevisionNumber } from "../../data";
import { InvalidTransitionError, nextState } from "../../domain";
import {
  auditTransition,
  buildEditorialStatus,
  type EditorialInput,
  entityKeyOf,
  failOnRace,
  loadEditorialState,
  moveRevision,
} from "../editorialState";

interface SaveDraftInput extends EditorialInput {
  body: SaveDraftBody;
}

/** Edits the working revision, or starts one (also from published content: the live one stays untouched). */
export function saveDraft(input: SaveDraftInput): Promise<EditorialStatusDto> {
  const { ctx, definition, body } = input;
  const parsed = definition.snapshotSchema.safeParse(body.snapshot);
  if (!parsed.success) {
    throw new ValidationError("The content is not valid", [
      { path: "snapshot", message: parsed.error.message },
    ]);
  }
  const snapshot = parsed.data as Prisma.InputJsonObject;

  return failOnRace(() =>
    withTransaction(db, async (tx) => {
      const { working } = await loadEditorialState(tx, input);
      if (!nextState(working?.state ?? null, "saveDraft"))
        throw new InvalidTransitionError();
      const key = entityKeyOf(input);
      const saved = working
        ? await moveRevision(tx, {
            organizationId: ctx.organizationId,
            revision: working,
            from: working.state,
            data: { snapshot, state: "DRAFT" },
          })
        : await createDraftRevision(tx, {
            key,
            number: await nextRevisionNumber(tx, key),
            authorId: ctx.user.id,
            snapshot,
          });
      await auditTransition(tx, input, {
        action: AUDIT_ACTIONS.editorial.draftSaved,
        before: working,
        after: saved,
      });
      return buildEditorialStatus(tx, input);
    }),
  );
}
