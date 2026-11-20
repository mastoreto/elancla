"use client";

import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LinkCardsDialog } from "../../components/link-cards-dialog";
import type { LinkCardItem } from "../../types";

const linkCardsNodeViewBlogPage = {
  container: cn("my-4 flex flex-col gap-2 rounded-[22px] bg-secondary p-3"),
  selected: cn("ring-2 ring-ring"),
  header: cn("flex items-center justify-between"),
  heading: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  edit: cn("rounded-full bg-background/90 p-2 shadow"),
  editIcon: cn("size-3.5"),
  card: cn("flex flex-col rounded-2xl bg-card px-3 py-2"),
  title: cn("text-sm font-bold"),
  href: cn("truncate text-xs text-[var(--tinta-apagada)]"),
};

/** Preview of the link cards block: one row per card. */
export function LinkCardsNodeView({ node, selected, editor, updateAttributes }: NodeViewProps) {
  const [editing, setEditing] = useState(false);
  const items = node.attrs.items as LinkCardItem[];

  return (
    <NodeViewWrapper
      className={cn(
        linkCardsNodeViewBlogPage.container,
        selected && linkCardsNodeViewBlogPage.selected,
      )}
      data-drag-handle=""
    >
      <div className={linkCardsNodeViewBlogPage.header}>
        <span className={linkCardsNodeViewBlogPage.heading}>Tarjetas de enlaces</span>
        {editor.isEditable ? (
          <button
            aria-label="Editar tarjetas de enlaces"
            className={linkCardsNodeViewBlogPage.edit}
            onClick={() => setEditing(true)}
            type="button"
          >
            <Pencil aria-hidden="true" className={linkCardsNodeViewBlogPage.editIcon} />
          </button>
        ) : null}
      </div>
      {items.map((item) => (
        <div className={linkCardsNodeViewBlogPage.card} key={`${item.href}-${item.title}`}>
          <span className={linkCardsNodeViewBlogPage.title}>{item.title}</span>
          <span className={linkCardsNodeViewBlogPage.href}>{item.href}</span>
        </div>
      ))}
      <LinkCardsDialog
        initial={items}
        onOpenChange={setEditing}
        onSubmit={(next) => updateAttributes({ items: next })}
        open={editing}
      />
    </NodeViewWrapper>
  );
}
