import type { AUDIT_ACTIONS, EditorialStatusDto } from "@ancla/contracts";
import type { Prisma } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import {
  type EntityKey,
  findLiveRevision,
  findReviewSettings,
  findRoleIdsOfUser,
  findWorkingRevision,
  type RevisionRow,
} from "../../data";
import {
  availableActions,
  hasEditorialPermission,
  isReviewer,
  mustBeReviewed,
  type ReviewSettings,
} from "../../domain";
import { toEditorialStatusDto, toRevisionAuditSummary } from "../../mappers";
import type { EditorialTypeDefinition } from "../../registry";

/** What every use case on one entity needs to know about the request. */
export interface EditorialInput {
  ctx: AuthenticatedContext;
  definition: EditorialTypeDefinition;
  entityId: string;
}

export function entityKeyOf({
  ctx,
  definition,
  entityId,
}: EditorialInput): EntityKey {
  return {
    organizationId: ctx.organizationId,
    contentType: definition.contentType,
    entityId,
  };
}

export interface EditorialState {
  working: RevisionRow | null;
  live: RevisionRow | null;
  settings: ReviewSettings;
  /** The user, or the author of the working revision, is under mandatory review. */
  mustReview: boolean;
  isReviewer: boolean;
  isAuthor: boolean;
}

/** Reads the entity and works out who the user is in front of it. */
export async function loadEditorialState(
  tx: Prisma.TransactionClient,
  input: EditorialInput,
): Promise<EditorialState> {
  const { ctx, definition } = input;
  const key = entityKeyOf(input);
  const working = await findWorkingRevision(tx, key);
  const live = await findLiveRevision(tx, key);
  const settings = await findReviewSettings(
    tx,
    ctx.organizationId,
    definition.contentType,
  );

  const roleIds = ctx.access.roles.map((role) => role.id);
  const actor = { userId: ctx.user.id, roleIds, isAdmin: ctx.access.isAdmin };
  const isAuthor = working?.authorId === ctx.user.id;
  const authorMustReview =
    working !== null &&
    !isAuthor &&
    mustBeReviewed(settings, {
      userId: working.authorId,
      roleIds: await findRoleIdsOfUser(tx, working.authorId),
    });
  return {
    working,
    live,
    settings,
    mustReview: mustBeReviewed(settings, actor) || authorMustReview,
    isReviewer: isReviewer(settings, actor),
    isAuthor,
  };
}

export function toStatus(
  input: EditorialInput,
  state: EditorialState,
): EditorialStatusDto {
  const { ctx, definition, entityId } = input;
  const allowed = (kind: "edit" | "publish"): boolean =>
    hasEditorialPermission(ctx.access, definition, kind, entityId);
  return toEditorialStatusDto({
    live: state.live,
    working: state.working,
    availableActions: availableActions({
      working: state.working?.state ?? null,
      live: state.live?.state ?? null,
      canEdit: allowed("edit"),
      canPublish: allowed("publish"),
      mustReview: state.mustReview,
      isReviewer: state.isReviewer,
      isAuthor: state.isAuthor,
    }),
  });
}

export async function buildEditorialStatus(
  tx: Prisma.TransactionClient,
  input: EditorialInput,
): Promise<EditorialStatusDto> {
  return toStatus(input, await loadEditorialState(tx, input));
}

type EditorialAuditAction =
  (typeof AUDIT_ACTIONS.editorial)[keyof typeof AUDIT_ACTIONS.editorial];

interface TransitionAudit {
  action: EditorialAuditAction;
  /** The revision before the change; `null` when the action created it. */
  before: RevisionRow | null;
  after: RevisionRow;
  /** Extra facts worth keeping, e.g. the comment of a change request. */
  metadata?: Record<string, unknown>;
}

/** One row per transition, written in the transaction of the change. */
export function auditTransition(
  tx: Prisma.TransactionClient,
  input: EditorialInput,
  { action, before, after, metadata }: TransitionAudit,
): Promise<void> {
  return writeAudit(tx, auditSourceFrom(input.ctx, input.ctx.organizationId), {
    action,
    entity: { type: "contentRevision", id: after.id },
    before: before ? toRevisionAuditSummary(before) : undefined,
    after: toRevisionAuditSummary(after),
    metadata: {
      contentType: input.definition.param,
      entityId: input.entityId,
      ...metadata,
    },
  });
}
