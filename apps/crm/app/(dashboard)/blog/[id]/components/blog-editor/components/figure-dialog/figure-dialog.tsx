"use client";

import {
  BLOG_CAPTION_MAX_LENGTH,
  BLOG_FIGURE_ALT_MAX_LENGTH,
  BLOG_FIGURE_ASPECTS,
  type MediaFileDto,
} from "@ancla/contracts";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardDialogContent } from "@/components/dashboard/board/board-dialog";
import { BoardInput, BoardSelect } from "@/components/dashboard/board/board-form";
import { ContentImageDropzone } from "@/components/dashboard/content";
import { Dialog } from "@/components/ui/dialog";
import { uploadMedia } from "@/lib/media";
import { cn } from "@/lib/utils";
import { rememberFigurePreview } from "../../lib/figurePreviewCache";
import type { DialogSubmit, FigureAspect, FigureAttrs } from "../../types";

const figureDialogBlogPage = {
  body: cn("flex flex-col gap-4"),
  actions: cn("flex justify-end gap-2"),
};

const ASPECT_LABELS = {
  landscape: "Horizontal (3:2)",
  wide: "Panorámica (16:9)",
  square: "Cuadrada (1:1)",
} satisfies Record<FigureAspect, string>;

const ASPECT_OPTIONS = BLOG_FIGURE_ASPECTS.map((aspect) => ({
  value: aspect,
  label: ASPECT_LABELS[aspect],
}));

function isFigureAspect(value: string): value is FigureAspect {
  return (BLOG_FIGURE_ASPECTS as readonly string[]).includes(value);
}

interface FigureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing an existing figure. */
  initial?: FigureAttrs;
  onSubmit: DialogSubmit<FigureAttrs>;
}

interface FigureFormProps extends Pick<FigureDialogProps, "initial" | "onSubmit"> {
  onClose: () => void;
}

function FigureForm({ initial, onSubmit, onClose }: FigureFormProps) {
  const [mediaId, setMediaId] = useState<string | null>(initial?.mediaId ?? null);
  const [fileName, setFileName] = useState("");
  const [alt, setAlt] = useState(initial?.alt ?? "");
  const [caption, setCaption] = useState(initial?.caption ?? "");
  const [aspect, setAspect] = useState<FigureAspect>(initial?.aspect ?? "landscape");
  const [showErrors, setShowErrors] = useState(false);

  async function upload(file: File): Promise<MediaFileDto> {
    const uploaded = await uploadMedia({ file, purpose: "contentImage" });
    rememberFigurePreview(uploaded);
    setMediaId(uploaded.id);
    return uploaded;
  }

  function confirm(): void {
    if (!mediaId) {
      setShowErrors(true);
      return;
    }
    onSubmit({ mediaId, alt: alt.trim(), caption: caption.trim() || null, aspect });
    onClose();
  }

  return (
    <BoardDialogContent
      description="Sube la imagen y descríbela para quienes no pueden verla."
      title={initial ? "Editar figura" : "Insertar figura"}
    >
      <div className={figureDialogBlogPage.body}>
        <ContentImageDropzone
          error={showErrors && !mediaId ? "Sube una imagen." : undefined}
          fileName={fileName}
          hint="JPG, PNG, WebP o AVIF"
          id="blog-figure-image"
          label="Imagen"
          onFileNameChange={setFileName}
          title={initial ? "Arrastra una imagen para reemplazarla" : "Arrastra una imagen"}
          uploadFile={upload}
        />
        <BoardInput
          hint="Texto alternativo. Déjalo vacío si la imagen es solo decorativa."
          id="blog-figure-alt"
          label="Descripción de la imagen"
          maxLength={BLOG_FIGURE_ALT_MAX_LENGTH}
          onChange={(event) => setAlt(event.target.value)}
          value={alt}
        />
        <BoardInput
          id="blog-figure-caption"
          label="Pie (opcional)"
          maxLength={BLOG_CAPTION_MAX_LENGTH}
          onChange={(event) => setCaption(event.target.value)}
          value={caption}
        />
        <BoardSelect
          id="blog-figure-aspect"
          label="Proporción"
          onValueChange={(value) => isFigureAspect(value) && setAspect(value)}
          options={ASPECT_OPTIONS}
          value={aspect}
        />
        <div className={figureDialogBlogPage.actions}>
          <BoardButton onClick={onClose} variant="ghost">
            Cancelar
          </BoardButton>
          <BoardButton onClick={confirm} variant="primary">
            {initial ? "Guardar" : "Insertar"}
          </BoardButton>
        </div>
      </div>
    </BoardDialogContent>
  );
}

export function FigureDialog({ open, onOpenChange, initial, onSubmit }: FigureDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <FigureForm initial={initial} onClose={() => onOpenChange(false)} onSubmit={onSubmit} />
    </Dialog>
  );
}
