"use client";

import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Pencil, Play } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { VideoDialog } from "../../components/video-dialog";
import type { VideoAttrs } from "../../types";

const videoNodeViewBlogPage = {
  container: cn("my-4 flex items-center gap-3 rounded-[22px] bg-secondary p-3"),
  selected: cn("ring-2 ring-ring"),
  thumb: cn("flex size-14 shrink-0 items-center justify-center rounded-2xl bg-card"),
  icon: cn("size-6"),
  text: cn("flex min-w-0 flex-1 flex-col"),
  title: cn("truncate text-sm font-bold"),
  meta: cn("truncate text-xs text-[var(--tinta-apagada)]"),
  edit: cn("rounded-full bg-background/90 p-2 shadow"),
  editIcon: cn("size-3.5"),
};

/** Preview of a video in the editor: a card with its title and id (no network request). */
export function VideoNodeView({ node, selected, editor, updateAttributes }: NodeViewProps) {
  const [editing, setEditing] = useState(false);
  const attrs = node.attrs as VideoAttrs;

  return (
    <NodeViewWrapper
      className={cn(videoNodeViewBlogPage.container, selected && videoNodeViewBlogPage.selected)}
      data-drag-handle=""
    >
      <span className={videoNodeViewBlogPage.thumb}>
        <Play aria-hidden="true" className={videoNodeViewBlogPage.icon} />
      </span>
      <span className={videoNodeViewBlogPage.text}>
        <span className={videoNodeViewBlogPage.title}>{attrs.title}</span>
        <span className={videoNodeViewBlogPage.meta}>
          YouTube · {attrs.youtubeId}
          {attrs.caption ? ` · ${attrs.caption}` : ""}
        </span>
      </span>
      {editor.isEditable ? (
        <button
          aria-label="Editar video"
          className={videoNodeViewBlogPage.edit}
          onClick={() => setEditing(true)}
          type="button"
        >
          <Pencil aria-hidden="true" className={videoNodeViewBlogPage.editIcon} />
        </button>
      ) : null}
      <VideoDialog
        initial={attrs}
        onOpenChange={setEditing}
        onSubmit={(next) => updateAttributes(next)}
        open={editing}
      />
    </NodeViewWrapper>
  );
}
