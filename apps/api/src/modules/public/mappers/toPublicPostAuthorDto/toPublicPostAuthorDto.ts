import { type PublicPostAuthorDto, personStatsDto } from "@ancla/contracts";
import { initials } from "../../../people";
import { pickLocalizedValue } from "../../domain";
import type { PublicBlogContext } from "../../types";
import { webpVariantsOf } from "../toPublicBlogImages";

/**
 * The author of a post. The card (`profile`) shows only while the BLOG_AUTHOR role is visible;
 * otherwise the post carries the name alone.
 */
export function toPublicPostAuthorDto(
  authorProfileId: string,
  articleCount: number,
  ctx: PublicBlogContext,
): PublicPostAuthorDto {
  const row = ctx.authors.get(authorProfileId);
  if (!row) return { name: "", initials: "", profile: null };
  const base = { name: row.name, initials: initials(row.name) };
  const [role] = row.roles;
  if (!role?.visible) return { ...base, profile: null };
  const photo = webpVariantsOf(row.photo, ctx.publicBaseUrl);
  return {
    ...base,
    profile: {
      photo: photo.length > 0 ? photo : null,
      bio: pickLocalizedValue(row.translations, ctx, (t) => t.bio),
      title: pickLocalizedValue(role.translations, ctx, (t) => t.title),
      stats: personStatsDto.parse(
        pickLocalizedValue(role.translations, ctx, (t) => t.stats) ?? [],
      ),
      articleCount,
    },
  };
}
