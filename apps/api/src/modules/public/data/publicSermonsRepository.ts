import { db } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

/** The PDFs attached to a sermon, with what the public link and the DTO need (the caller keeps the ready ones). */
export function findSermonDocuments(
  organizationId: string,
  mediaIds: readonly string[],
) {
  return forOrganization(db, organizationId).mediaFile.findMany({
    where: { id: { in: [...mediaIds] }, purpose: "contentDocument" },
    select: { id: true, status: true, originalName: true, size: true },
  });
}

export type PublicSermonDocumentRow = Awaited<
  ReturnType<typeof findSermonDocuments>
>[number];
