import type { PublicSermonAttachmentDto } from "@ancla/contracts";
import { documentKey } from "../../../media";

interface StoredDocument {
  id: string;
  status: string;
  originalName: string;
  size: number;
}

/** `null` while the PDF is not ready (its public copy does not exist yet). */
export function toPublicSermonAttachment(
  organizationId: string,
  media: StoredDocument,
  publicBaseUrl: string,
): PublicSermonAttachmentDto | null {
  if (media.status !== "ready") return null;
  return {
    url: `${publicBaseUrl}/${documentKey(organizationId, media.id)}`,
    name: media.originalName,
    sizeBytes: media.size,
  };
}
