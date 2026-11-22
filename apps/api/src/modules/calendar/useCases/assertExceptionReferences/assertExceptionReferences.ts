import type { UpsertScheduleExceptionBody } from "@ancla/contracts";
import type { Prisma } from "@ancla/db";
import { isExceptionDateTaken, scheduleSetExists } from "../../data";
import {
  ExceptionDateTakenError,
  InvalidCalendarReferenceError,
} from "../../domain";

/** The replacement set is the organization's own and no other exception holds the date. */
export async function assertExceptionReferences(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    body: UpsertScheduleExceptionBody;
    exceptId?: string;
  },
): Promise<void> {
  const { organizationId, body, exceptId } = input;
  const { replacementSetId } = body;
  if (
    replacementSetId !== null &&
    !(await scheduleSetExists(tx, organizationId, replacementSetId))
  ) {
    throw new InvalidCalendarReferenceError(
      "invalid_schedule_set",
      "The replacement schedule set does not exist",
    );
  }
  if (
    await isExceptionDateTaken(tx, {
      organizationId,
      date: body.date,
      exceptId,
    })
  ) {
    throw new ExceptionDateTakenError();
  }
}
