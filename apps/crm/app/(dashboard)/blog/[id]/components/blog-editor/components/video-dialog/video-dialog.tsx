"use client";

import { BLOG_CAPTION_MAX_LENGTH, BLOG_VIDEO_TITLE_MAX_LENGTH } from "@ancla/contracts";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardDialogContent } from "@/components/dashboard/board/board-dialog";
import { BoardInput } from "@/components/dashboard/board/board-form";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { DialogSubmit, VideoAttrs } from "../../types";
import { youtubeIdFromUrl } from "../../utils/youtubeIdFromUrl";

const videoDialogBlogPage = {
  body: cn("flex flex-col gap-4"),
  actions: cn("flex justify-end gap-2"),
};

const INVALID_URL_MESSAGE = "No reconocemos ese enlace de YouTube.";

interface VideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing an existing video. */
  initial?: VideoAttrs;
  onSubmit: DialogSubmit<VideoAttrs>;
}

interface VideoFormProps extends Pick<VideoDialogProps, "initial" | "onSubmit"> {
  onClose: () => void;
}

function VideoForm({ initial, onSubmit, onClose }: VideoFormProps) {
  const [url, setUrl] = useState(initial ? `https://youtu.be/${initial.youtubeId}` : "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [caption, setCaption] = useState(initial?.caption ?? "");
  const [showErrors, setShowErrors] = useState(false);

  const youtubeId = youtubeIdFromUrl(url);
  const trimmedTitle = title.trim();
  const canSubmit = youtubeId !== null && trimmedTitle !== "";

  function confirm(): void {
    if (!canSubmit) {
      setShowErrors(true);
      return;
    }
    onSubmit({ youtubeId, title: trimmedTitle, caption: caption.trim() || null });
    onClose();
  }

  return (
    <BoardDialogContent
      description="Pega el enlace del video de YouTube."
      title={initial ? "Editar video" : "Insertar video"}
    >
      <div className={videoDialogBlogPage.body}>
        <BoardInput
          autoFocus={true}
          error={showErrors && !youtubeId ? INVALID_URL_MESSAGE : undefined}
          id="blog-video-url"
          label="Enlace de YouTube"
          onChange={(event) => setUrl(event.target.value)}
          value={url}
        />
        <BoardInput
          error={showErrors && !trimmedTitle ? "Escribe un título para el video." : undefined}
          hint="Lo leen los lectores de pantalla."
          id="blog-video-title"
          label="Título del video"
          maxLength={BLOG_VIDEO_TITLE_MAX_LENGTH}
          onChange={(event) => setTitle(event.target.value)}
          value={title}
        />
        <BoardInput
          id="blog-video-caption"
          label="Pie (opcional)"
          maxLength={BLOG_CAPTION_MAX_LENGTH}
          onChange={(event) => setCaption(event.target.value)}
          value={caption}
        />
        <div className={videoDialogBlogPage.actions}>
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

export function VideoDialog({ open, onOpenChange, initial, onSubmit }: VideoDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <VideoForm initial={initial} onClose={() => onOpenChange(false)} onSubmit={onSubmit} />
    </Dialog>
  );
}
