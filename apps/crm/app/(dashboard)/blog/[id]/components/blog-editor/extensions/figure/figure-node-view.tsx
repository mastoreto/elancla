"use client";

import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { ImageIcon, Pencil } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FigureDialog } from "../../components/figure-dialog";
import { figurePreviewUrl } from "../../lib/figurePreviewCache";
import type { FigureAspect, FigureAttrs } from "../../types";

const figureNodeViewBlogPage = {
  container: cn("my-4 flex flex-col gap-2 rounded-[22px] bg-secondary p-3"),
  selected: cn("ring-2 ring-ring"),
  frame: cn("relative w-full overflow-hidden rounded-2xl bg-card"),
  image: cn("size-full object-cover"),
  placeholder: cn("flex size-full items-center justify-center text-[var(--tinta-apagada)]"),
  icon: cn("size-8"),
  caption: cn("text-center text-[13px] text-[var(--tinta-suave)]"),
  edit: cn("absolute top-2 right-2 rounded-full bg-background/90 p-2 shadow"),
  editIcon: cn("size-3.5"),
};

const ASPECT_CLASSES = {
  landscape: cn("aspect-[3/2]"),
  wide: cn("aspect-video"),
  square: cn("aspect-square"),
} satisfies Record<FigureAspect, string>;

/** Preview of a figure in the editor; the image only shows if it was uploaded in this session. */
export function FigureNodeView({ node, selected, editor, updateAttributes }: NodeViewProps) {
  const [editing, setEditing] = useState(false);
  const attrs = node.attrs as FigureAttrs;
  const previewUrl = figurePreviewUrl(attrs.mediaId);

  return (
    <NodeViewWrapper
      className={cn(figureNodeViewBlogPage.container, selected && figureNodeViewBlogPage.selected)}
      data-drag-handle=""
    >
      <div className={cn(figureNodeViewBlogPage.frame, ASPECT_CLASSES[attrs.aspect])}>
        {previewUrl ? (
          // biome-ignore lint/performance/noImgElement: a one-off preview of an uploaded variant, not a layout image.
          <img alt={attrs.alt} className={figureNodeViewBlogPage.image} src={previewUrl} />
        ) : (
          <div className={figureNodeViewBlogPage.placeholder} role="img" aria-label={attrs.alt}>
            <ImageIcon aria-hidden="true" className={figureNodeViewBlogPage.icon} />
          </div>
        )}
        {editor.isEditable ? (
          <button
            aria-label="Editar figura"
            className={figureNodeViewBlogPage.edit}
            onClick={() => setEditing(true)}
            type="button"
          >
            <Pencil aria-hidden="true" className={figureNodeViewBlogPage.editIcon} />
          </button>
        ) : null}
      </div>
      {attrs.caption ? <p className={figureNodeViewBlogPage.caption}>{attrs.caption}</p> : null}
      <FigureDialog
        initial={attrs}
        onOpenChange={setEditing}
        onSubmit={(next) => updateAttributes(next)}
        open={editing}
      />
    </NodeViewWrapper>
  );
}
