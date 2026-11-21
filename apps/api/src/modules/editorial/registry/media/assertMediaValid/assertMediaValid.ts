import type { GoLiveContext } from "../../editorialTypes";
import { InvalidMediaError } from "../errors";

/**
 * Every id must be a finished content image of the organization (400 `invalid_media`). `message`
 * says what the type's images are, for the CMS user ("The cover and the figures ...").
 */
export async function assertMediaValid(
  { tx, organizationId }: Pick<GoLiveContext, "tx" | "organizationId">,
  mediaIds: readonly string[],
  message: string,
): Promise<void> {
  const ids = [...new Set(mediaIds)];
  if (ids.length === 0) return;
  const valid = await tx.mediaFile.count({
    where: {
      id: { in: ids },
      organizationId,
      purpose: "contentImage",
      status: "ready",
    },
  });
  if (valid !== ids.length) throw new InvalidMediaError(message);
}
