import type { UpsertRecurringActivityBody } from "@ancla/contracts";
import type { Prisma } from "@ancla/db";
import {
  findExistingMinistryIds,
  placeExists,
  scheduleSetExists,
} from "../../data";
import { InvalidCalendarReferenceError } from "../../domain";

/** The set, the place and the ministries of the body have to be the organization's own. */
export async function assertActivityReferences(
  tx: Prisma.TransactionClient,
  organizationId: string,
  body: Pick<
    UpsertRecurringActivityBody,
    "scheduleSetId" | "placeId" | "ministryIds"
  >,
): Promise<void> {
  if (!(await scheduleSetExists(tx, organizationId, body.scheduleSetId))) {
    throw new InvalidCalendarReferenceError(
      "invalid_schedule_set",
      "The schedule set does not exist",
    );
  }
  if (body.placeId && !(await placeExists(tx, organizationId, body.placeId))) {
    throw new InvalidCalendarReferenceError(
      "invalid_place",
      "The place does not exist",
    );
  }
  const unique = [...new Set(body.ministryIds)];
  const found = await findExistingMinistryIds(tx, organizationId, unique);
  if (found.length !== unique.length) {
    throw new InvalidCalendarReferenceError(
      "invalid_ministry",
      "Some ministries do not exist",
    );
  }
}
