import type { PostListItemDto } from "@ancla/contracts";
import Link from "next/link";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { stateLabel, stateTone } from "@/components/editorial/editorial-status-bar";
import { getChurchRoutePath } from "@/lib/church";
import { formatCount, formatShortDate } from "@/lib/format-content";
import { cn } from "@/lib/utils";

/** `YYYY-MM-DD`: what `formatShortDate` reads of an ISO datetime. */
const ISO_DATE_LENGTH = 10;

const postRowBlogPage = {
  container: cn(
    "flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-[20px] px-3 py-2.5 transition-colors",
    "hover:bg-[var(--oro-50)] focus-visible:bg-[var(--oro-50)]",
  ),
  main: cn("flex min-w-0 flex-1 basis-60 flex-col gap-0.5"),
  title: cn("truncate text-[15px] font-bold"),
  untitled: cn("font-normal text-[var(--tinta-apagada)]"),
  meta: cn("truncate text-[12.5px] text-[var(--tinta-apagada)]"),
  states: cn("flex flex-wrap items-center gap-1.5"),
  date: cn("w-24 text-[13px] text-[var(--tinta-suave)]"),
  views: cn("w-20 text-right text-[13px] text-[var(--tinta-suave)]"),
};

interface PostRowProps {
  post: PostListItemDto;
}

/** One post of the list: title, category and author, editorial state, published date and views. */
export function PostRow({ post }: PostRowProps) {
  const { live, working } = post;
  const meta = [post.category?.name, post.author?.name].filter(Boolean).join(" · ");
  return (
    <Link
      className={postRowBlogPage.container}
      data-testid="post-row"
      href={getChurchRoutePath("blog", post.id)}
    >
      <span className={postRowBlogPage.main}>
        <span className={cn(postRowBlogPage.title, !post.title && postRowBlogPage.untitled)}>
          {post.title ?? "Sin título"}
        </span>
        {meta ? <span className={postRowBlogPage.meta}>{meta}</span> : null}
      </span>
      <span className={postRowBlogPage.states}>
        {live ? (
          <StatusPill tone={stateTone(live.state)}>{stateLabel(live.state)}</StatusPill>
        ) : null}
        {working ? (
          <StatusPill tone={stateTone(working.state)}>
            {live ? `Nueva versión: ${stateLabel(working.state)}` : stateLabel(working.state)}
          </StatusPill>
        ) : null}
        {live || working ? null : <StatusPill tone="ink">Borrador</StatusPill>}
      </span>
      <span className={postRowBlogPage.date}>
        {formatShortDate(live?.publishedAt?.slice(0, ISO_DATE_LENGTH))}
      </span>
      <span className={postRowBlogPage.views} title="Vistas en 30 días">
        {formatCount(post.views30d)}
      </span>
    </Link>
  );
}
