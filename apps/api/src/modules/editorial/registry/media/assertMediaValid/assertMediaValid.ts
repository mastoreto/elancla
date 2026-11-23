import type { MediaPurpose } from "@ancla/contracts";
import type { GoLiveContext } from "../../editorialTypes";
import { InvalidMediaError } from "../errors";

/**
 * Every id must be a finished file of the organization with the given purpose (400
 * `invalid_media`): a content image by default, `contentDocument` for public PDFs. `message` says
 * what the type's files are, for the CMS user ("The cover and the figures ...").
 */
export async function assertMediaValid(
  { tx, organizationId }: Pick<GoLiveContext, "tx" | "organizationId">,
  mediaIds: readonly string[],
  message: string,
  purpose: Extract<
    MediaPurpose,
    "contentImage" | "contentDocument"
  > = "contentImage",
): Promise<void> {
  const ids = [...new Set(mediaIds)];
  if (ids.length === 0) return;
  const valid = await tx.mediaFile.count({
    where: {
      id: { in: ids },
      organizationId,
      purpose,
      status: "ready",
    },
  });
  if (valid !== ids.length) throw new InvalidMediaError(message);
}
