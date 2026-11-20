import type { EditorialContentType, EditorialState } from "@ancla/db";
import { db, Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

const PERSON = { select: { id: true, name: true } } as const;
const WITH_PEOPLE = { author: PERSON, reviewer: PERSON } as const;
const HISTORY_LIMIT = 100;
const INBOX_LIMIT = 50;

export type RevisionRow = Prisma.ContentRevisionGetPayload<{
  include: typeof WITH_PEOPLE;
}>;

export interface EntityKey {
  organizationId: string;
  contentType: EditorialContentType;
  entityId: string;
}

const WORKING_STATES: EditorialState[] = [
  "DRAFT",
  "IN_REVIEW",
  "CHANGES_REQUESTED",
];
const LIVE_STATES: EditorialState[] = ["PUBLISHED", "PAUSED"];

/** The revision being edited or reviewed, if any (the partial index allows at most one). */
export function findWorkingRevision(
  tx: Prisma.TransactionClient,
  key: EntityKey,
): Promise<RevisionRow | null> {
  return tx.contentRevision.findFirst({
    where: { ...key, state: { in: WORKING_STATES } },
    include: WITH_PEOPLE,
  });
}

/** The revision the public site reads: published, or paused (hidden but kept). */
export function findLiveRevision(
  tx: Prisma.TransactionClient,
  key: EntityKey,
): Promise<RevisionRow | null> {
  return tx.contentRevision.findFirst({
    where: { ...key, state: { in: LIVE_STATES } },
    include: WITH_PEOPLE,
  });
}

/** Live and working revisions of every entity of a type, for list screens (one query, no N+1). */
export function listCurrentRevisionRows(
  organizationId: string,
  contentType: EditorialContentType,
): Promise<RevisionRow[]> {
  return forOrganization(db, organizationId).contentRevision.findMany({
    where: { contentType, state: { in: [...WORKING_STATES, ...LIVE_STATES] } },
    include: WITH_PEOPLE,
  });
}

export function listRevisionRows(key: EntityKey): Promise<RevisionRow[]> {
  return forOrganization(db, key.organizationId).contentRevision.findMany({
    where: { contentType: key.contentType, entityId: key.entityId },
    include: WITH_PEOPLE,
    orderBy: { number: "desc" },
    take: HISTORY_LIMIT,
  });
}

export async function nextRevisionNumber(
  tx: Prisma.TransactionClient,
  key: EntityKey,
): Promise<number> {
  const { _max } = await tx.contentRevision.aggregate({
    where: key,
    _max: { number: true },
  });
  return (_max.number ?? 0) + 1;
}

export interface NewRevision {
  key: EntityKey;
  number: number;
  authorId: string;
  snapshot: Prisma.InputJsonObject;
}

export function createDraftRevision(
  tx: Prisma.TransactionClient,
  { key, number, authorId, snapshot }: NewRevision,
): Promise<RevisionRow> {
  return tx.contentRevision.create({
    data: { ...key, number, authorId, snapshot, state: "DRAFT" },
    include: WITH_PEOPLE,
  });
}

export interface RevisionChange {
  organizationId: string;
  id: string;
  /** The state the caller saw: if another request moved it meanwhile, nothing is updated. */
  from: readonly EditorialState[];
  data: Prisma.ContentRevisionUncheckedUpdateManyInput;
}

/** Conditional update: returns the new row, or `null` when the revision was not in `from`. */
export async function changeRevision(
  tx: Prisma.TransactionClient,
  { organizationId, id, from, data }: RevisionChange,
): Promise<RevisionRow | null> {
  const { count } = await tx.contentRevision.updateMany({
    where: { id, organizationId, state: { in: [...from] } },
    data,
  });
  if (count === 0) return null;
  return tx.contentRevision.findUniqueOrThrow({
    where: { id },
    include: WITH_PEOPLE,
  });
}

/** The live revision stops being live when a newer one takes its place. */
export function supersedeRevision(
  tx: Prisma.TransactionClient,
  organizationId: string,
  live: RevisionRow,
): Promise<RevisionRow | null> {
  return changeRevision(tx, {
    organizationId,
    id: live.id,
    from: LIVE_STATES,
    data: { state: "SUPERSEDED" },
  });
}

/** A concurrent writer won the partial unique index: the caller sees an invalid transition. */
export function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export function findToReviewRows(
  organizationId: string,
  contentTypes: EditorialContentType[],
  reviewerId: string,
): Promise<RevisionRow[]> {
  if (contentTypes.length === 0) return Promise.resolve([]);
  return forOrganization(db, organizationId).contentRevision.findMany({
    where: {
      state: "IN_REVIEW",
      contentType: { in: contentTypes },
      authorId: { not: reviewerId },
    },
    include: WITH_PEOPLE,
    orderBy: { submittedAt: "asc" },
    take: INBOX_LIMIT,
  });
}

export function findChangesRequestedRows(
  organizationId: string,
  authorId: string,
): Promise<RevisionRow[]> {
  return forOrganization(db, organizationId).contentRevision.findMany({
    where: { state: "CHANGES_REQUESTED", authorId },
    include: WITH_PEOPLE,
    orderBy: { decidedAt: "desc" },
    take: INBOX_LIMIT,
  });
}
