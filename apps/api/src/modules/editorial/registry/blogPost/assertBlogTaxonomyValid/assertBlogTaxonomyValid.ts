import type { BlogPostSnapshot } from "@ancla/contracts";
import type { GoLiveContext } from "../../editorialTypes";
import { InvalidBlogReferenceError } from "../errors";

/** Category and series (if any) must exist in the organization and not be deleted. */
export async function assertBlogTaxonomyValid({
  tx,
  organizationId,
  snapshot,
}: GoLiveContext): Promise<void> {
  const { categoryId, seriesId } = snapshot as BlogPostSnapshot;
  const category = await tx.category.findFirst({
    where: { id: categoryId, organizationId, deletedAt: null },
    select: { id: true },
  });
  if (!category) {
    throw new InvalidBlogReferenceError(
      "invalid_category",
      "The category does not exist",
    );
  }
  if (seriesId === undefined) return;
  const series = await tx.series.findFirst({
    where: { id: seriesId, organizationId, deletedAt: null },
    select: { id: true },
  });
  if (!series) {
    throw new InvalidBlogReferenceError(
      "invalid_series",
      "The series does not exist",
    );
  }
}
