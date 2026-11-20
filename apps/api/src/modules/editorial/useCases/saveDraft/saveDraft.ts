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
import type { EditorialTypeDefinition } from "../../registry";
import {
  auditTransition,
  buildEditorialStatus,
  type EditorialInput,
  entityKeyOf,
  failOnRace,
  loadEditorialState,
  moveRevision,
} from "../editorialState";

/** Type rules that need the organization (enabled languages...); a message is a 400. */
async function assertSnapshotFitsOrganization(
  definition: EditorialTypeDefinition,
  snapshot: Record<string, unknown>,
  organizationId: string,
): Promise<void> {
  if (!definition.validateSnapshot) return;
  const organization = await db.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: { locales: true, defaultLocale: true },
  });
  const message = definition.validateSnapshot(snapshot, organization);
  if (message) {
    throw new ValidationError("The content is not valid", [
      { path: "snapshot", message },
    ]);
  }
}

interface SaveDraftInput extends EditorialInput {
  body: SaveDraftBody;
}

/** Edits the working revision, or starts one (also from published content: the live one stays untouched). */
export async function saveDraft(
  input: SaveDraftInput,
): Promise<EditorialStatusDto> {
  const { ctx, definition, body } = input;
  const parsed = definition.snapshotSchema.safeParse(body.snapshot);
  if (!parsed.success) {
    throw new ValidationError("The content is not valid", [
      { path: "snapshot", message: parsed.error.message },
    ]);
  }
  await assertSnapshotFitsOrganization(
    definition,
    parsed.data,
    ctx.organizationId,
  );
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
