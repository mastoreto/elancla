import type { Prisma, PrismaClient } from "@ancla/db";

/** Unit of work: everything `work` writes commits together or not at all. */
export function withTransaction<Result>(
  client: PrismaClient,
  work: (tx: Prisma.TransactionClient) => Promise<Result>,
): Promise<Result> {
  return client.$transaction(work);
}
