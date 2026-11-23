import type { SermonSnapshot } from "@ancla/contracts";
import type { GoLiveContext } from "../../editorialTypes";
import { InvalidSermonReferenceError } from "../errors";

/**
 * The preacher, when there is one, is a person of the organization holding the PREACHER role
 * (400 `invalid_preacher`). A sermon without a preacher is valid (imported ones have none).
 */
export async function assertSermonPreacherValid({
  tx,
  organizationId,
  snapshot,
}: GoLiveContext): Promise<void> {
  const { preacherProfileId } = snapshot as unknown as SermonSnapshot;
  if (preacherProfileId === undefined) return;
  const preacher = await tx.personProfile.findFirst({
    where: {
      id: preacherProfileId,
      organizationId,
      roles: { some: { context: "PREACHER" } },
    },
    select: { id: true },
  });
  if (!preacher) {
    throw new InvalidSermonReferenceError(
      "invalid_preacher",
      "The preacher must be a person profile with the preacher role",
    );
  }
}
