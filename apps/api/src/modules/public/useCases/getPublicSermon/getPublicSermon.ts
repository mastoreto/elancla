import type {
  PublicSermonAttachmentDto,
  PublicSermonDto,
} from "@ancla/contracts";
import { NotFoundError } from "../../../../core/errors";
import { findSermonDocuments } from "../../data";
import { toPublicSermonAttachment, toPublicSermonDto } from "../../mappers";
import type { ServedSermonEntry } from "../../types";
import { loadSermonCorpus } from "../loadSermonCorpus";

/** The ready PDFs of the sermon, in the order the editors listed them. */
async function loadAttachments(
  organizationId: string,
  entry: ServedSermonEntry,
  publicBaseUrl: string,
): Promise<PublicSermonAttachmentDto[]> {
  const { attachmentMediaIds } = entry.snapshot;
  if (attachmentMediaIds.length === 0) return [];
  const rows = await findSermonDocuments(organizationId, attachmentMediaIds);
  const byId = new Map(rows.map((row) => [row.id, row]));
  return attachmentMediaIds.flatMap((id) => {
    const row = byId.get(id);
    const attachment = row
      ? toPublicSermonAttachment(organizationId, row, publicBaseUrl)
      : null;
    return attachment ? [attachment] : [];
  });
}

/**
 * A published sermon by the slug it has in any of its languages, served in the requested one (or
 * the default). Drafts, paused and unknown sermons are the same 404.
 */
export async function getPublicSermon(input: {
  organizationId: string;
  slug: string;
  requestedLocale: string | undefined;
}): Promise<PublicSermonDto> {
  const { organizationId, slug, requestedLocale } = input;
  const { entries, ctx } = await loadSermonCorpus({
    organizationId,
    requestedLocale,
  });
  // The slug may belong to another language than the one served (a link in any language works).
  const found = entries.find((entry) =>
    Object.values(entry.snapshot.translations).some((t) => t.slug === slug),
  );
  if (!found) throw new NotFoundError("The sermon was not found");
  const attachments = await loadAttachments(
    organizationId,
    found,
    ctx.publicBaseUrl,
  );
  return toPublicSermonDto({ entry: found, entries, attachments, ctx });
}
