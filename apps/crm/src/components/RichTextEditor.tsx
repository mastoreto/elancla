"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Underline as UnderlineIcon,
  Unlink,
} from "lucide-react";
import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

const RichTextEditorSharedPage = {
  toolbarButton: cn("h-8 w-8 rounded"),
  separator: cn("w-px h-5 bg-border mx-0.5 self-center"),
  block: cn("flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5 bg-muted/30"),
};

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        RichTextEditorSharedPage.toolbarButton,
        isActive && "bg-accent text-accent-foreground",
      )}
    >
      {children}
    </Button>
  );
}

interface ToolbarSeparatorProps {
  className?: string;
}

function ToolbarSeparator({ className }: ToolbarSeparatorProps) {
  return <div className={cn(RichTextEditorSharedPage.separator, className)} />;
}

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
  hasError?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Escribe el contenido aquí...",
  className,
  editorClassName,
  hasError,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[300px] w-full px-4 py-3 text-sm focus:outline-none prose prose-sm max-w-none",
          "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2",
          "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
          "[&_a]:text-primary [&_a]:underline",
          editorClassName,
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? "" : editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sync external value changes (e.g., form reset)
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.isEmpty ? "" : editor.getHTML();
    if (currentHtml !== value) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL del enlace", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "rounded-lg border bg-background overflow-hidden",
        hasError ? "border-destructive" : "border-input",
        "focus-within:ring-1",
        hasError ? "focus-within:ring-destructive" : "focus-within:ring-ring",
        className,
      )}
    >
      {/* Toolbar */}
      <div className={RichTextEditorSharedPage.block}>
        <ToolbarButton
          title="Negrita"
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
        >
          <Bold className="size-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="Cursiva"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
        >
          <Italic className="size-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="Subrayado"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
        >
          <UnderlineIcon className="size-3.5" />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton
          title="Título 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="size-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="Título 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 className="size-3.5" />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton
          title="Lista con viñetas"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
        >
          <List className="size-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="Lista numerada"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
        >
          <ListOrdered className="size-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="Cita"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
        >
          <Quote className="size-3.5" />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton title="Insertar enlace" onClick={setLink} isActive={editor.isActive("link")}>
          <LinkIcon className="size-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="Quitar enlace"
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
        >
          <Unlink className="size-3.5" />
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
