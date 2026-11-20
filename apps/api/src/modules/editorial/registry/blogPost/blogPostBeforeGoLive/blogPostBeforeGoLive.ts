import type { GoLiveContext } from "../../editorialTypes";
import { assertBlogAuthorValid } from "../assertBlogAuthorValid";
import { assertBlogMediaValid } from "../assertBlogMediaValid";
import { assertBlogSlugsFree } from "../assertBlogSlugsFree";
import { assertBlogSlugsLocked } from "../assertBlogSlugsLocked";
import { assertBlogTaxonomyValid } from "../assertBlogTaxonomyValid";
import { fixFirstLiveAt } from "../fixFirstLiveAt";

/**
 * Everything a post must satisfy to go live (publish, approve, resume), in the transaction of the
 * transition. The checks come first; the URL date is only fixed once all of them passed.
 */
export async function blogPostBeforeGoLive(
  context: GoLiveContext,
): Promise<void> {
  await assertBlogAuthorValid(context);
  await assertBlogTaxonomyValid(context);
  await assertBlogMediaValid(context);
  await assertBlogSlugsFree(context);
  await assertBlogSlugsLocked(context);
  await fixFirstLiveAt(context);
}
