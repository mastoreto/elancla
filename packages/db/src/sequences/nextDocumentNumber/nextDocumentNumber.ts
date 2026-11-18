import type { PrismaClient } from "../../generated/prisma/client";

type RawQueryClient = Pick<PrismaClient, "$queryRaw">;

interface DocumentNumberInput {
  organizationId: string;
  /** Document prefix, e.g. "MOV". */
  type: string;
  year: number;
}

/**
 * Next gap-free number for a document type and year (D-03). Must run inside the same transaction
 * as the insert that uses it: the row lock serializes concurrent callers and a rollback releases
 * the number, so no gaps appear (Postgres sequences would leave gaps on rollback).
 */
export async function nextDocumentNumber(
  client: RawQueryClient,
  { organizationId, type, year }: DocumentNumberInput,
): Promise<number> {
  const rows = await client.$queryRaw<{ last: number }[]>`
    INSERT INTO document_sequences ("organizationId", "type", "year", "last")
    VALUES (${organizationId}::uuid, ${type}, ${year}, 1)
    ON CONFLICT ("organizationId", "type", "year")
    DO UPDATE SET "last" = document_sequences."last" + 1
    RETURNING "last"
  `;
  const [row] = rows;
  if (!row) {
    throw new Error("Document sequence did not return a number");
  }
  return row.last;
}
