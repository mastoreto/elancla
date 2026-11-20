"use client";

import {
  BLOG_NOTE_LABEL_MAX_LENGTH,
  BLOG_PULLQUOTE_CITE_MAX_LENGTH,
  BLOG_VERSE_REFERENCE_MAX_LENGTH,
} from "@ancla/contracts";
import type { Editor } from "@tiptap/react";
import {
  BookOpen,
  ImageIcon,
  LetterText,
  LinkIcon,
  MessageSquareQuote,
  StickyNote,
  Video as VideoIcon,
} from "lucide-react";
import { useState } from "react";
import { ToolbarButton } from "@/components/RichTextEditor";
import { FigureDialog } from "../figure-dialog";
import { LinkCardsDialog } from "../link-cards-dialog";
import { TextPromptDialog } from "../text-prompt-dialog";
import { VideoDialog } from "../video-dialog";

type BlogDialog = "verse" | "figure" | "pullquote" | "video" | "note" | "linkCards";

const ICON_CLASS = "size-3.5";

interface BlogEditorToolbarProps {
  editor: Editor;
}

/** The insertion buttons for the blog's own nodes, with the dialog each one asks for. */
export function BlogEditorToolbar({ editor }: BlogEditorToolbarProps) {
  const [dialog, setDialog] = useState<BlogDialog | null>(null);
  const close = (open: boolean) => {
    if (!open) setDialog(null);
  };
  const insert = (content: Record<string, unknown>) =>
    editor.chain().focus().insertContent(content).run();

  return (
    <>
      <ToolbarButton
        isActive={editor.isActive("paragraph", { dropCap: true })}
        onClick={() => {
          const active = editor.isActive("paragraph", { dropCap: true });
          editor.chain().focus().updateAttributes("paragraph", { dropCap: !active }).run();
        }}
        title="Letra capital"
      >
        <LetterText className={ICON_CLASS} />
      </ToolbarButton>
      <ToolbarButton onClick={() => setDialog("verse")} title="Versículo">
        <BookOpen className={ICON_CLASS} />
      </ToolbarButton>
      <ToolbarButton onClick={() => setDialog("figure")} title="Figura">
        <ImageIcon className={ICON_CLASS} />
      </ToolbarButton>
      <ToolbarButton onClick={() => setDialog("pullquote")} title="Cita destacada">
        <MessageSquareQuote className={ICON_CLASS} />
      </ToolbarButton>
      <ToolbarButton onClick={() => setDialog("video")} title="Video de YouTube">
        <VideoIcon className={ICON_CLASS} />
      </ToolbarButton>
      <ToolbarButton onClick={() => setDialog("note")} title="Nota">
        <StickyNote className={ICON_CLASS} />
      </ToolbarButton>
      <ToolbarButton onClick={() => setDialog("linkCards")} title="Tarjetas de enlaces">
        <LinkIcon className={ICON_CLASS} />
      </ToolbarButton>

      <TextPromptDialog
        description="Cita de la Biblia que acompaña al texto del versículo."
        label="Referencia"
        hint="Por ejemplo: Hebreos 11:1"
        maxLength={BLOG_VERSE_REFERENCE_MAX_LENGTH}
        onOpenChange={close}
        onSubmit={(reference) => insert({ type: "verse", attrs: { reference } })}
        open={dialog === "verse"}
        submitLabel="Insertar"
        title="Insertar versículo"
      />
      <TextPromptDialog
        label="Autor o fuente (opcional)"
        maxLength={BLOG_PULLQUOTE_CITE_MAX_LENGTH}
        onOpenChange={close}
        onSubmit={(cite) => insert({ type: "pullquote", attrs: { cite: cite || null } })}
        open={dialog === "pullquote"}
        required={false}
        submitLabel="Insertar"
        title="Insertar cita destacada"
      />
      <TextPromptDialog
        description="El rótulo aparece arriba de la nota."
        label="Rótulo"
        hint="Por ejemplo: Para reflexionar"
        maxLength={BLOG_NOTE_LABEL_MAX_LENGTH}
        onOpenChange={close}
        onSubmit={(label) =>
          insert({ type: "note", attrs: { label }, content: [{ type: "paragraph" }] })
        }
        open={dialog === "note"}
        submitLabel="Insertar"
        title="Insertar nota"
      />
      <FigureDialog
        onOpenChange={close}
        onSubmit={(attrs) => insert({ type: "figure", attrs })}
        open={dialog === "figure"}
      />
      <VideoDialog
        onOpenChange={close}
        onSubmit={(attrs) => insert({ type: "video", attrs })}
        open={dialog === "video"}
      />
      <LinkCardsDialog
        onOpenChange={close}
        onSubmit={(items) => insert({ type: "linkCards", attrs: { items } })}
        open={dialog === "linkCards"}
      />
    </>
  );
}
