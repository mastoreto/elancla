import { db, Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";
import { YearExistsError } from "../domain";

const UNIQUE_VIOLATION = "P2002";

export type CalendarYearRow = Prisma.CalendarYearGetPayload<object>;

type Client = Prisma.TransactionClient | typeof db;

export function listYearRows(
  organizationId: string,
): Promise<CalendarYearRow[]> {
  return forOrganization(db, organizationId).calendarYear.findMany({
    orderBy: { year: "asc" },
  });
}

export function findYearRow(
  client: Client,
  organizationId: string,
  year: number,
): Promise<CalendarYearRow | null> {
  return client.calendarYear.findFirst({ where: { organizationId, year } });
}

/** A new year is a draft; a second one with the same number is a 409. */
export async function createYearRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  year: number,
): Promise<CalendarYearRow> {
  try {
    return await tx.calendarYear.create({ data: { organizationId, year } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_VIOLATION
    ) {
      throw new YearExistsError();
    }
    throw error;
  }
}

/** Draft to published, only if it is still a draft; `false` when someone published it first. */
export async function markYearPublished(
  tx: Prisma.TransactionClient,
  input: { organizationId: string; year: number; userId: string },
): Promise<boolean> {
  const { count } = await tx.calendarYear.updateMany({
    where: {
      organizationId: input.organizationId,
      year: input.year,
      status: "DRAFT",
    },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      publishedById: input.userId,
    },
  });
  return count > 0;
}
