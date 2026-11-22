import type { EventSnapshot } from "@ancla/contracts";
import type { Prisma } from "@ancla/db";
import { NotFoundError } from "../../../../../core/errors";
import type { GoLiveContext } from "../../editorialTypes";
import { assertMediaValid } from "../../media";
import {
  InvalidEventReferenceError,
  YearMismatchError,
  YearNotPublishedError,
} from "../errors";

const YEAR_LENGTH = 4;

/** The year a "YYYY-MM-DD" date falls in. */
const yearOfDate = (date: string): number => Number(date.slice(0, YEAR_LENGTH));

async function assertPlaceValid(
  tx: Prisma.TransactionClient,
  organizationId: string,
  snapshot: EventSnapshot,
): Promise<void> {
  if (snapshot.placeMode !== "place" || !snapshot.placeId) return;
  const count = await tx.place.count({
    where: { id: snapshot.placeId, organizationId, deletedAt: null },
  });
  if (count === 0) {
    throw new InvalidEventReferenceError(
      "invalid_place",
      "The place does not exist",
    );
  }
}

async function assertMinistriesValid(
  tx: Prisma.TransactionClient,
  organizationId: string,
  snapshot: EventSnapshot,
): Promise<void> {
  const ids = [...new Set(snapshot.ministryIds)];
  if (ids.length === 0) return;
  const count = await tx.ministry.count({
    where: { id: { in: ids }, organizationId },
  });
  if (count !== ids.length) {
    throw new InvalidEventReferenceError(
      "invalid_ministry",
      "Some ministries do not exist",
    );
  }
}

/**
 * What an event must satisfy to go live (publish, approve, resume, or the publication of its
 * year), in the transaction of the transition. The checks come first; the `SEQUENCE` and the
 * `LAST-MODIFIED` instant that calendar clients use to refresh the event are bumped only once all
 * of them passed.
 */
export async function eventBeforeGoLive(context: GoLiveContext): Promise<void> {
  const { tx, organizationId, entityId, now } = context;
  const snapshot = context.snapshot as unknown as EventSnapshot;
  const event = await tx.event.findFirst({
    where: { id: entityId, organizationId },
    select: { year: true },
  });
  if (!event) throw new NotFoundError("Content not found");

  if (yearOfDate(snapshot.startDate) !== event.year) {
    throw new YearMismatchError(event.year);
  }
  await assertPlaceValid(tx, organizationId, snapshot);
  await assertMinistriesValid(tx, organizationId, snapshot);
  await assertMediaValid(
    context,
    snapshot.imageId ? [snapshot.imageId] : [],
    "The image must be a finished content image of the organization",
  );
  const published = await tx.calendarYear.count({
    where: { organizationId, year: event.year, status: "PUBLISHED" },
  });
  if (published === 0) throw new YearNotPublishedError(event.year);

  await tx.event.update({
    where: { id: entityId },
    data: { sequence: { increment: 1 }, liveAt: now, needsReview: false },
  });
}
