"use client";

import { PERMISSIONS, type PostListItemDto } from "@ancla/contracts";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { useAccess } from "@/lib/authz/AccessProvider";
import { can } from "@/lib/authz/can";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { NewPostButton } from "../new-post-button";
import { PostRow } from "../post-row";

const blogListPageContentBlogPage = {
  container: cn("flex flex-col gap-[18px]"),
  intro: cn("flex flex-wrap items-center gap-4"),
  description: cn("min-w-60 flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  list: cn("flex flex-col gap-1"),
  legend: cn("flex justify-end gap-4 px-3 text-xs font-bold text-[var(--tinta-apagada)]"),
  empty: cn("py-6 text-center text-sm text-[var(--tinta-apagada)]"),
};

interface BlogListPageContentProps {
  posts: readonly PostListItemDto[];
}

export function BlogListPageContent({ posts }: BlogListPageContentProps) {
  const access = useAccess();
  return (
    <div className={blogListPageContentBlogPage.container}>
      <div className={blogListPageContentBlogPage.intro}>
        <span className={blogListPageContentBlogPage.description}>
          Los artículos del blog: su estado editorial, su publicación y cuánto se leen.
        </span>
        <BoardButton href={getChurchRoutePath("blog", "taxonomy")} variant="outline">
          Categorías y series
        </BoardButton>
        {can(access, PERMISSIONS.blogPosts.create) ? <NewPostButton /> : null}
      </div>
      <BoardCard>
        {posts.length === 0 ? (
          <p className={blogListPageContentBlogPage.empty}>Todavía no hay artículos.</p>
        ) : (
          <div className={blogListPageContentBlogPage.list}>
            <div aria-hidden="true" className={blogListPageContentBlogPage.legend}>
              <span>Publicado</span>
              <span>Vistas (30 d)</span>
            </div>
            {posts.map((post) => (
              <PostRow key={post.id} post={post} />
            ))}
          </div>
        )}
      </BoardCard>
    </div>
  );
}
