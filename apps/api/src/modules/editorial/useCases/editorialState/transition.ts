import type { EditorialState, Prisma } from "@ancla/db";
import {
  changeRevision,
  isUniqueViolation,
  type RevisionRow,
  supersedeRevision,
} from "../../data";
import { InvalidTransitionError } from "../../domain";

interface Move {
  organizationId: string;
  revision: RevisionRow;
  /** The state the use case checked against the machine. */
  from: EditorialState;
  data: Prisma.ContentRevisionUncheckedUpdateManyInput;
}

/** Moves a revision only if it is still where the use case saw it: otherwise someone got there first. */
export async function moveRevision(
  tx: Prisma.TransactionClient,
  { organizationId, revision, from, data }: Move,
): Promise<RevisionRow> {
  const moved = await changeRevision(tx, {
    organizationId,
    id: revision.id,
    from: [from],
    data,
  });
  if (!moved) throw new InvalidTransitionError();
  return moved;
}

/** Publishing a working revision retires the live one first (the partial index allows one). */
export async function retireLive(
  tx: Prisma.TransactionClient,
  organizationId: string,
  live: RevisionRow | null,
): Promise<void> {
  if (!live) return;
  const superseded = await supersedeRevision(tx, organizationId, live);
  if (!superseded) throw new InvalidTransitionError();
}

/** Two writers racing for the same entity: the loser hits the partial unique index. */
export async function failOnRace<Result>(
  work: () => Promise<Result>,
): Promise<Result> {
  try {
    return await work();
  } catch (error) {
    if (isUniqueViolation(error)) throw new InvalidTransitionError();
    throw error;
  }
}
