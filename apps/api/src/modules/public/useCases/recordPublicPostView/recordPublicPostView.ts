import type { RecordPostViewBody } from "@ancla/contracts";
import { recordPostView } from "../../../blog";

/** Counts a view of the post with that slug; it never fails the caller for a post it can't count. */
export async function recordPublicPostView(input: {
  organizationId: string;
  slug: string;
  visitor: RecordPostViewBody;
}): Promise<void> {
  const { organizationId, slug, visitor } = input;
  await recordPostView({
    organizationId,
    slug,
    ip: visitor.ip,
    userAgent: visitor.userAgent,
  });
}
