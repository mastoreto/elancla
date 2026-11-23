import type { GoLiveContext } from "../../editorialTypes";
import { assertSlugsFree, assertSlugsLocked } from "../../slugs";
import { assertSermonMediaValid } from "../assertSermonMediaValid";
import { assertSermonPreacherValid } from "../assertSermonPreacherValid";
import { assertSermonSeriesValid } from "../assertSermonSeriesValid";
import { fixSermonFirstLiveAt } from "../fixSermonFirstLiveAt";

/**
 * Everything a sermon must satisfy to go live (publish, approve, resume), in the transaction of
 * the transition. The checks come first; `firstLiveAt` is only set once all of them passed.
 */
export async function sermonBeforeGoLive(
  context: GoLiveContext,
): Promise<void> {
  await assertSermonPreacherValid(context);
  await assertSermonSeriesValid(context);
  await assertSermonMediaValid(context);
  await assertSlugsFree(context, "SERMON");
  await assertSlugsLocked(context, "SERMON");
  await fixSermonFirstLiveAt(context);
}
