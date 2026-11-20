import type { BlogPostSnapshot } from "@ancla/contracts";
import type { GoLiveContext } from "../../editorialTypes";
import { InvalidBlogReferenceError } from "../errors";

/** The author is a person of the organization holding the BLOG_AUTHOR role (400 `invalid_author`). */
export async function assertBlogAuthorValid({
  tx,
  organizationId,
  snapshot,
}: GoLiveContext): Promise<void> {
  const { authorProfileId } = snapshot as BlogPostSnapshot;
  const author = await tx.personProfile.findFirst({
    where: {
      id: authorProfileId,
      organizationId,
      roles: { some: { context: "BLOG_AUTHOR" } },
    },
    select: { id: true },
  });
  if (!author) {
    throw new InvalidBlogReferenceError(
      "invalid_author",
      "The author must be a person profile with the blog author role",
    );
  }
}
