import type { PublicPostDto } from "@ancla/contracts";
import { NotFoundError } from "../../../../core/errors";
import { figureMediaIds } from "../../../blog";
import { toPublicPostDto } from "../../mappers";
import { loadBlogCorpus, loadBlogImages } from "../loadBlogCorpus";

/**
 * A visible post by the slug it has in any of its languages, served in the requested one (or the
 * default). Drafts, paused, scheduled and unknown posts are the same 404.
 */
export async function getPublicPost(input: {
  organizationId: string;
  slug: string;
  requestedLocale: string | undefined;
}): Promise<PublicPostDto> {
  const { organizationId, slug, requestedLocale } = input;
  const { entries, ctx } = await loadBlogCorpus({
    organizationId,
    requestedLocale,
    now: new Date(),
  });
  // The slug may belong to another language than the one served (a link in any language works).
  const found = entries.find(
    (entry) =>
      entry.visible &&
      Object.values(entry.snapshot.translations).some((t) => t.slug === slug),
  );
  if (!found) throw new NotFoundError("The post was not found");
  const figureImages = await loadBlogImages(
    organizationId,
    figureMediaIds(found.translation.body),
  );
  return toPublicPostDto({
    entry: found,
    entries,
    ctx: { ...ctx, images: new Map([...ctx.images, ...figureImages]) },
  });
}
