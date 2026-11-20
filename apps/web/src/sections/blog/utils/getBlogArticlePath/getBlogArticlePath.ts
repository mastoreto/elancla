interface ArticleAddress {
  /** `YYYY-MM-DD`, the date of the URL (set when the post first went live). */
  urlDate: string;
  slug: string;
}

/** Locale-free path of a post: `/blog/2026/04/29/<slug>`. Wrap it in `localizePath` for a link. */
export function getBlogArticlePath({ urlDate, slug }: ArticleAddress): string {
  return `/blog/${urlDate.replaceAll('-', '/')}/${slug}`;
}

/** The `urlDate` a request for `/blog/<year>/<month>/<day>/...` expects. */
export function toUrlDate(
  year: string | undefined,
  month: string | undefined,
  day: string | undefined
): string {
  return `${year}-${month}-${day}`;
}
