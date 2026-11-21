import type { GoLiveContext } from "../../editorialTypes";
import { assertSlugsFree, assertSlugsLocked } from "../../slugs";
import { assertBlogAuthorValid } from "../assertBlogAuthorValid";
import { assertBlogMediaValid } from "../assertBlogMediaValid";
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
  await assertSlugsFree(context, "BLOG_POST");
  await assertSlugsLocked(context, "BLOG_POST");
  await fixFirstLiveAt(context);
}
