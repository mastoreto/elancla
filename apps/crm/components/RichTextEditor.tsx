"use client";

import { RICH_TEXT_HREF_PATTERN, type RichTextDoc } from "@ancla/contracts";
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
  Minus,
  Quote,
  Underline as UnderlineIcon,
  Unlink,
  WrapText,
} from "lucide-react";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
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
  toolbarButton: cn("size-8 rounded-full bg-card shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)]"),
  separator: cn("mx-0.5 h-5 w-px self-center bg-border"),
  block: cn("flex flex-wrap items-center gap-1.5 bg-secondary px-3 py-2.5"),
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

interface RichTextEditorBaseProps {
  placeholder?: string;
  className?: string;
  editorClassName?: string;
  hasError?: boolean;
  disabled?: boolean;
}

interface HtmlRichTextEditorProps extends RichTextEditorBaseProps {
  /** `html` (default) keeps the full editor and speaks HTML strings. */
  format?: "html";
  value: string;
  onChange: (html: string) => void;
}

interface JsonRichTextEditorProps extends RichTextEditorBaseProps {
  /**
   * `json` speaks the Tiptap JSON the simple pages store and offers only what that schema admits:
   * headings 2-3, bold, italic, http(s)/mailto links, lists, quote, line break and rule.
   */
  format: "json";
  value: RichTextDoc;
  onChange: (doc: RichTextDoc) => void;
}

export type RichTextEditorProps = HtmlRichTextEditorProps | JsonRichTextEditorProps;

const LINK_NOT_ALLOWED_MESSAGE = "El enlace debe empezar con https://, http:// o mailto:";

export function RichTextEditor(props: RichTextEditorProps) {
  const {
    placeholder = "Escribe el contenido aquí...",
    className,
    editorClassName,
    hasError,
    disabled = false,
  } = props;
  const isJson = props.format === "json";
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
          ...(isJson ? { isAllowedUri: (url: string) => RICH_TEXT_HREF_PATTERN.test(url) } : {}),
        },
        ...(isJson ? { underline: false, strike: false, code: false, codeBlock: false } : {}),
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: props.value,
    editable: !disabled,
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
      if (props.format === "json") {
        props.onChange(editor.getJSON() as RichTextDoc);
        return;
      }
      props.onChange(editor.isEmpty ? "" : editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sync external value changes (e.g., form reset)
  const { value } = props;
  useEffect(() => {
    if (!editor) return;
    if (typeof value === "string") {
      const currentHtml = editor.isEmpty ? "" : editor.getHTML();
      if (currentHtml !== value) editor.commands.setContent(value || "", { emitUpdate: false });
      return;
    }
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(value)) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL del enlace", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (isJson && !RICH_TEXT_HREF_PATTERN.test(url)) {
      toast.error(LINK_NOT_ALLOWED_MESSAGE);
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor, isJson]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "rounded-[22px] border bg-card overflow-hidden",
        hasError ? "border-destructive" : "border-input",
        "focus-within:ring-1",
        hasError ? "focus-within:ring-destructive" : "focus-within:ring-ring",
        className,
      )}
    >
      {/* Toolbar */}
      <div className={cn(RichTextEditorSharedPage.block, disabled && "hidden")}>
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

        {isJson ? null : (
          <ToolbarButton
            title="Subrayado"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
          >
            <UnderlineIcon className="size-3.5" />
          </ToolbarButton>
        )}

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

        {isJson ? (
          <>
            <ToolbarButton
              title="Salto de línea"
              onClick={() => editor.chain().focus().setHardBreak().run()}
            >
              <WrapText className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              title="Línea divisoria"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
              <Minus className="size-3.5" />
            </ToolbarButton>
          </>
        ) : null}

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
