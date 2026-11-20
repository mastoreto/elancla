"use client";

import type { BlogRichTextDoc } from "@ancla/contracts";
import { RichTextEditor } from "@/components/RichTextEditor";
import { cn } from "@/lib/utils";
import { BlogEditorToolbar } from "./components/blog-editor-toolbar";
import { blogExtensions } from "./extensions";

// Tailwind cannot style nodes the editor renders itself, so the blog nodes get arbitrary variants.
const blogEditorBlogPage = {
  content: cn(
    "[&_p[data-drop-cap]]:first-letter:float-left",
    "[&_p[data-drop-cap]]:first-letter:pr-2",
    "[&_p[data-drop-cap]]:first-letter:text-5xl",
    "[&_p[data-drop-cap]]:first-letter:font-bold",
  ),
  verse: cn(
    "[&_blockquote[data-verse]]:before:content-[attr(data-reference)]",
    "[&_blockquote[data-verse]]:before:block",
    "[&_blockquote[data-verse]]:before:text-xs",
    "[&_blockquote[data-verse]]:before:font-bold",
    "[&_blockquote[data-verse]]:border-primary",
  ),
  pullquote: cn(
    "[&_blockquote[data-pullquote]]:text-lg",
    "[&_blockquote[data-pullquote]]:font-semibold",
    "[&_blockquote[data-pullquote]]:text-foreground",
  ),
  note: cn(
    "[&_aside[data-note]]:before:content-[attr(data-label)]",
    "[&_aside[data-note]]:before:block",
    "[&_aside[data-note]]:before:text-xs",
    "[&_aside[data-note]]:before:font-bold",
    "[&_aside[data-note]]:rounded-2xl",
    "[&_aside[data-note]]:bg-secondary",
    "[&_aside[data-note]]:px-4",
    "[&_aside[data-note]]:py-2",
  ),
};

interface BlogEditorProps {
  value: BlogRichTextDoc;
  onChange: (doc: BlogRichTextDoc) => void;
  disabled?: boolean;
  hasError?: boolean;
}

/** The article body editor: the base JSON editor plus the blog's own nodes and their buttons. */
export function BlogEditor({ value, onChange, disabled, hasError }: BlogEditorProps) {
  return (
    <RichTextEditor<BlogRichTextDoc>
      disabled={disabled}
      editorClassName={cn(
        blogEditorBlogPage.content,
        blogEditorBlogPage.verse,
        blogEditorBlogPage.pullquote,
        blogEditorBlogPage.note,
      )}
      extensions={blogExtensions}
      format="json"
      hasError={hasError}
      onChange={onChange}
      toolbarExtra={(editor) => <BlogEditorToolbar editor={editor} />}
      value={value}
    />
  );
}
