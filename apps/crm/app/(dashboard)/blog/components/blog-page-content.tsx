"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardPagination } from "@/components/dashboard/board/board-pagination";
import { StatCard, StatCardGrid } from "@/components/dashboard/board/stat-card";
import {
  type ContentFilters,
  ContentListToolbar,
  filterContent,
  paginate,
} from "@/components/dashboard/content";
import { getChurchRoutePath } from "@/lib/church";
import { formatCompactCount } from "@/lib/format-content";
import { cn } from "@/lib/utils";
import type { BlogConfig, BlogPost } from "../types";
import {
  BLOG_PAGE_SIZE,
  countWithoutImage,
  getCategoryNames,
  getPrimaryCategory,
  getTotalViews,
} from "../utils";
import { BlogTable } from "./blog-table";
import { BlogVisibilityCard } from "./blog-visibility-card";

const blogPageContentContentPage = {
  page: cn("flex flex-col gap-5"),
  header: cn("flex flex-wrap items-center gap-4"),
  description: cn("min-w-60 flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  action: cn("ml-auto"),
  icon: cn("size-4"),
};

interface BlogPageContentProps {
  posts: BlogPost[];
  config: BlogConfig;
}

export function BlogPageContent({ posts: initialPosts, config }: BlogPageContentProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [visible, setVisible] = useState(config.status === "live");
  const [filters, setFilters] = useState<ContentFilters>({ status: "all", search: "", group: "" });
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      filterContent(
        posts.map((post) => ({
          ...post,
          group: getPrimaryCategory(post),
          searchText: `${post.title} ${post.author.name} ${getPrimaryCategory(post)}`,
        })),
        filters,
      ),
    [posts, filters],
  );
  const paged = paginate(filtered, page, BLOG_PAGE_SIZE);
  const categories = getCategoryNames(posts);
  const published = posts.filter((post) => post.status === "published").length;
  const drafts = posts.filter((post) => post.status === "draft").length;

  return (
    <div className={blogPageContentContentPage.page}>
      <div className={blogPageContentContentPage.header}>
        <p className={blogPageContentContentPage.description}>
          Gestiona y publica el contenido editorial de la iglesia.
        </p>
        <BoardButton
          className={blogPageContentContentPage.action}
          href={getChurchRoutePath("blog", "new")}
          variant="primary"
        >
          <Plus aria-hidden="true" className={blogPageContentContentPage.icon} />
          Nuevo artículo
        </BoardButton>
      </div>

      <StatCardGrid>
        <StatCard
          detail={`${categories.length} categorías`}
          label="Total posts"
          value={String(posts.length)}
        />
        <StatCard detail="En el sitio" label="Publicados" value={String(published)} />
        <StatCard
          detail={`${countWithoutImage(posts)} sin imagen`}
          label="Borradores"
          value={String(drafts)}
        />
        <StatCard
          detail="+14 % vs. mes anterior"
          highlighted={true}
          label="Vistas totales"
          value={formatCompactCount(getTotalViews(posts))}
        />
      </StatCardGrid>

      <BlogVisibilityCard onVisibleChange={setVisible} visible={visible} />

      <ContentListToolbar
        filters={filters}
        groupLabel="Categoría"
        groups={categories}
        onFiltersChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        searchLabel="Buscar artículo"
        searchPlaceholder="Buscar artículo…"
      />

      <BlogTable
        footer={
          <BoardPagination
            onPageChange={setPage}
            page={paged.page}
            pageCount={paged.pageCount}
            pageSize={BLOG_PAGE_SIZE}
            total={filtered.length}
          />
        }
        onDelete={(id) => setPosts((current) => current.filter((post) => post.id !== id))}
        posts={paged.items}
      />
    </div>
  );
}
