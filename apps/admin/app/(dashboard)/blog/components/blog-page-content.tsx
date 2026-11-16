"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  BookOpen,
  Eye,
  FileText,
  MoreHorizontal,
  Newspaper,
  PauseCircle,
  Pencil,
  PlayCircle,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { parseLocalDate } from "@/lib/utils";
import { DashboardMetricStrip, DashboardPageHeader } from "@/src/componentes/dashboard";
import { type ColumnDef, DataTable, type FilterConfig } from "@/src/components/DataTable";
import type { BlogAuthor, BlogCategory, BlogConfig, BlogPost } from "../types";
import { BlogPostStatusBadge } from "./blog-post-status-badge";
import { BlogStatusControl } from "./blog-status-control";

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  return format(parseLocalDate(dateStr), "dd MMM yyyy", { locale: es });
}

function formatViews(views: number): string {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return String(views);
}

function useBlogMetrics(posts: BlogPost[]) {
  return useMemo(() => {
    const published = posts.filter((p) => p.status === "published");
    const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
    const draftsAndPaused = posts.filter((p) => p.status === "draft" || p.status === "paused");

    return [
      {
        label: "Total posts",
        value: String(posts.length),
        detail: "Todos los estados",
        icon: Newspaper,
        tone: "neutral" as const,
      },
      {
        label: "Publicados",
        value: String(published.length),
        detail: "En vivo ahora",
        icon: BookOpen,
        tone: "up" as const,
        accent: true,
      },
      {
        label: "Vistas totales",
        value: formatViews(totalViews),
        detail: "Acumuladas",
        icon: Eye,
        tone: "neutral" as const,
      },
      {
        label: "Borradores",
        value: String(draftsAndPaused.length),
        detail: "Sin publicar",
        icon: FileText,
        tone: "neutral" as const,
      },
    ];
  }, [posts]);
}

function buildColumns(
  onPauseToggle: (post: BlogPost) => void,
  onDelete: (post: BlogPost) => void,
): ColumnDef<BlogPost>[] {
  return [
    {
      key: "title",
      label: "Título",
      render: (post) => (
        <div className="max-w-[280px]">
          <p className="font-medium text-foreground truncate">{post.title}</p>
          <p className="text-xs text-muted-foreground truncate">/{post.slug}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: (post) => <BlogPostStatusBadge status={post.status} />,
    },
    {
      key: "views",
      label: "Vistas",
      render: (post) => (
        <span className="tabular-nums text-sm font-medium">{formatViews(post.views)}</span>
      ),
    },
    {
      key: "categories",
      label: "Categorías",
      render: (post) => (
        <div className="flex flex-wrap gap-1">
          {post.categories.map((cat) => (
            <Badge key={cat.id} variant="secondary" className="text-xs font-normal">
              {cat.label}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "writtenAt",
      label: "Redacción",
      render: (post) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatDate(post.writtenAt)}
        </span>
      ),
    },
    {
      key: "publishedAt",
      label: "Publicación",
      render: (post) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatDate(post.publishedAt)}
        </span>
      ),
    },
    {
      key: "author",
      label: "Autor",
      render: (post) => <span className="text-sm">{post.author.name}</span>,
    },
    {
      key: "actions",
      label: "",
      className: "w-[1%] whitespace-nowrap",
      render: (post) => (
        <RowActions post={post} onPauseToggle={onPauseToggle} onDelete={onDelete} />
      ),
    },
  ];
}

function buildFilters(authors: BlogAuthor[], categories: BlogCategory[]): FilterConfig<BlogPost>[] {
  return [
    {
      key: "title",
      type: "text",
      label: "Buscar",
      placeholder: "Buscar por título...",
      getValue: (post) => post.title,
    },
    {
      key: "publishedAt",
      type: "daterange",
      label: "Fecha de publicación",
      getValue: (post) => post.publishedAt ?? "",
    },
    {
      key: "author",
      type: "select",
      label: "Autor",
      placeholder: "Todos los autores",
      options: authors.map((a) => ({ value: a.id, label: a.name })),
      getValue: (post) => post.author.id,
    },
    {
      key: "category",
      type: "select",
      label: "Categoría",
      placeholder: "Todas las categorías",
      options: categories.map((c) => ({ value: c.id, label: c.label })),
      getValue: (post) => post.categories.map((c) => c.id).join(","),
    },
  ];
}

interface RowActionsProps {
  post: BlogPost;
  onPauseToggle: (post: BlogPost) => void;
  onDelete: (post: BlogPost) => void;
}

function RowActions({ post, onPauseToggle, onDelete }: RowActionsProps) {
  const isPaused = post.status === "paused";
  const isDraft = post.status === "draft";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Acciones</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => toast.info("Próximamente: previsualización")}>
          <Eye className="size-4" />
          Ver
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => toast.info("Próximamente: editor de posts")}>
          <Pencil className="size-4" />
          Editar
        </DropdownMenuItem>

        <DropdownMenuItem disabled={isDraft} onClick={() => onPauseToggle(post)}>
          {isPaused ? (
            <>
              <PlayCircle className="size-4" />
              Reanudar
            </>
          ) : (
            <>
              <PauseCircle className="size-4" />
              Pausar
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDelete(post)}
        >
          <Trash2 className="size-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface BlogPageContentProps {
  posts: BlogPost[];
  authors: BlogAuthor[];
  categories: BlogCategory[];
  config: BlogConfig;
}

export function BlogPageContent({
  posts,
  authors,
  categories,
  config: initialConfig,
}: BlogPageContentProps) {
  const [config, setConfig] = useState(initialConfig);
  const metrics = useBlogMetrics(posts);

  // Callbacks only close over stable toast import — [] deps are intentionally correct.
  const columns = useMemo(
    () =>
      buildColumns(
        (post) => {
          const next = post.status === "paused" ? "published" : "paused";
          toast.success(`"${post.title}" ${next === "paused" ? "pausado" : "reanudado"}`);
        },
        (post) => {
          toast.error(`Eliminar "${post.title}"`, {
            description: "Esta acción no se puede deshacer.",
            action: { label: "Confirmar", onClick: () => toast.success("Post eliminado") },
          });
        },
      ),
    [],
  );

  const filters = useMemo(() => buildFilters(authors, categories), [authors, categories]);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        kicker="Contenido"
        title="Blog"
        emphasis="posts"
        description="Gestiona y publica el contenido editorial de la iglesia."
        actions={
          <BlogStatusControl
            status={config.status}
            onStatusChange={(status) => setConfig({ ...config, status })}
          />
        }
      />

      <DashboardMetricStrip metrics={metrics} />

      <DataTable
        data={posts}
        columns={columns}
        filters={filters}
        pageSize={10}
        keyExtractor={(post) => post.id}
        emptyMessage="No se encontraron posts con esos filtros"
      />
    </div>
  );
}
