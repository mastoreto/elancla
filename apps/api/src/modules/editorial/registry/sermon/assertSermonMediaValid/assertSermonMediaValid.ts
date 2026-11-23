import type { SermonSnapshot } from "@ancla/contracts";
import type { GoLiveContext } from "../../editorialTypes";
import { assertMediaValid } from "../../media";

/**
 * The own cover must be a finished content image and every attachment a finished public PDF
 * (`contentDocument`) of the organization (400 `invalid_media`).
 */
export async function assertSermonMediaValid(
  context: GoLiveContext,
): Promise<void> {
  const { coverMediaId, attachmentMediaIds } =
    context.snapshot as unknown as SermonSnapshot;
  await assertMediaValid(
    context,
    coverMediaId ? [coverMediaId] : [],
    "The cover must be a finished content image of the organization",
  );
  await assertMediaValid(
    context,
    attachmentMediaIds,
    "The attachments must be finished public PDF documents of the organization",
    "contentDocument",
  );
}
