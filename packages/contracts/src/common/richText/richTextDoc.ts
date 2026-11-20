import { z } from "zod";

/** Link targets a page may carry. Anything else (`javascript:`, `data:`...) is rejected. */
export const RICH_TEXT_HREF_PATTERN = /^(https?:|mailto:)/i;

export const RICH_TEXT_HREF_MAX_LENGTH = 2048;
export const RICH_TEXT_TEXT_MAX_LENGTH = 10_000;
/** `doc` is depth 1: blockquote > list > item > list > item > paragraph > text still fits. */
export const RICH_TEXT_MAX_DEPTH = 10;
export const RICH_TEXT_MAX_NODES = 2_000;
export const RICH_TEXT_MAX_TOTAL_TEXT_LENGTH = 50_000;
export const RICH_TEXT_HEADING_LEVELS = [2, 3] as const;

export type RichTextMark =
  | { type: "bold" }
  | { type: "italic" }
  | { type: "link"; attrs: { href: string } };

export interface RichTextText {
  type: "text";
  text: string;
  marks?: RichTextMark[];
}
export interface RichTextHardBreak {
  type: "hardBreak";
}
export type RichTextInline = RichTextText | RichTextHardBreak;

export interface RichTextParagraph {
  type: "paragraph";
  content?: RichTextInline[];
}
export interface RichTextHeading {
  type: "heading";
  attrs: { level: (typeof RICH_TEXT_HEADING_LEVELS)[number] };
  content?: RichTextInline[];
}
export interface RichTextHorizontalRule {
  type: "horizontalRule";
}
export interface RichTextBlockquote {
  type: "blockquote";
  content: RichTextBlock[];
}
export interface RichTextListItem {
  type: "listItem";
  content: RichTextBlock[];
}
export interface RichTextBulletList {
  type: "bulletList";
  content: RichTextListItem[];
}
export interface RichTextOrderedList {
  type: "orderedList";
  content: RichTextListItem[];
}
export type RichTextBlock =
  | RichTextParagraph
  | RichTextHeading
  | RichTextHorizontalRule
  | RichTextBlockquote
  | RichTextBulletList
  | RichTextOrderedList;

export interface RichTextDoc {
  type: "doc";
  content: RichTextBlock[];
}

/*
 * Tiptap JSON, as a whitelist. Objects are not strict on purpose: the editor adds attributes
 * the page does not use (`target`, `rel`, `class`, `start`...) and zod strips them, so what is
 * stored is exactly what the renderer understands. Unknown node or mark types are rejected.
 */
const markSchema: z.ZodType<RichTextMark> = z.discriminatedUnion("type", [
  z.object({ type: z.literal("bold") }),
  z.object({ type: z.literal("italic") }),
  z.object({
    type: z.literal("link"),
    attrs: z.object({
      href: z
        .string()
        .max(RICH_TEXT_HREF_MAX_LENGTH)
        .regex(RICH_TEXT_HREF_PATTERN),
    }),
  }),
]);

const textSchema: z.ZodType<RichTextText> = z.object({
  type: z.literal("text"),
  text: z.string().min(1).max(RICH_TEXT_TEXT_MAX_LENGTH),
  marks: z.array(markSchema).max(3).optional(),
});

const inlineSchema: z.ZodType<RichTextInline> = z.union([
  textSchema,
  z.object({ type: z.literal("hardBreak") }),
]);

const paragraphSchema: z.ZodType<RichTextParagraph> = z.object({
  type: z.literal("paragraph"),
  content: z.array(inlineSchema).optional(),
});

const headingSchema: z.ZodType<RichTextHeading> = z.object({
  type: z.literal("heading"),
  attrs: z.object({
    level: z.union([z.literal(2), z.literal(3)]),
  }),
  content: z.array(inlineSchema).optional(),
});

const blockSchema: z.ZodType<RichTextBlock> = z.lazy(() =>
  z.union([
    paragraphSchema,
    headingSchema,
    z.object({ type: z.literal("horizontalRule") }),
    blockquoteSchema,
    bulletListSchema,
    orderedListSchema,
  ]),
);

const listItemSchema: z.ZodType<RichTextListItem> = z.lazy(() =>
  z.object({ type: z.literal("listItem"), content: z.array(blockSchema) }),
);

const blockquoteSchema: z.ZodType<RichTextBlockquote> = z.lazy(() =>
  z.object({ type: z.literal("blockquote"), content: z.array(blockSchema) }),
);
const bulletListSchema: z.ZodType<RichTextBulletList> = z.lazy(() =>
  z.object({ type: z.literal("bulletList"), content: z.array(listItemSchema) }),
);
const orderedListSchema: z.ZodType<RichTextOrderedList> = z.lazy(() =>
  z.object({
    type: z.literal("orderedList"),
    content: z.array(listItemSchema),
  }),
);

const docSchema: z.ZodType<RichTextDoc> = z.object({
  type: z.literal("doc"),
  content: z.array(blockSchema),
});

interface Limits {
  nodes: number;
  textLength: number;
  deepest: number;
}

function measure(value: unknown): Limits {
  const limits: Limits = { nodes: 0, textLength: 0, deepest: 0 };
  const pending: { node: unknown; depth: number }[] = [
    { node: value, depth: 1 },
  ];
  while (pending.length > 0) {
    const { node, depth } = pending.pop() as { node: unknown; depth: number };
    if (typeof node !== "object" || node === null) continue;
    const { text, content } = node as { text?: unknown; content?: unknown };
    limits.nodes += 1;
    limits.deepest = Math.max(limits.deepest, depth);
    if (typeof text === "string") limits.textLength += text.length;
    if (
      limits.nodes > RICH_TEXT_MAX_NODES ||
      limits.deepest > RICH_TEXT_MAX_DEPTH
    )
      return limits;
    if (Array.isArray(content)) {
      for (const child of content)
        pending.push({ node: child, depth: depth + 1 });
    }
  }
  return limits;
}

/**
 * Walks the input without recursion before the real schema runs, so a hostile document cannot
 * exhaust the stack: depth, node count and total text are bounded first.
 */
const boundedInput = z.unknown().superRefine((value, ctx) => {
  const { nodes, textLength, deepest } = measure(value);
  if (deepest > RICH_TEXT_MAX_DEPTH)
    ctx.addIssue({ code: "custom", message: "The text is nested too deeply" });
  else if (nodes > RICH_TEXT_MAX_NODES)
    ctx.addIssue({ code: "custom", message: "The text has too many nodes" });
  else if (textLength > RICH_TEXT_MAX_TOTAL_TEXT_LENGTH)
    ctx.addIssue({ code: "custom", message: "The text is too long" });
});

export const richTextDocSchema: z.ZodType<RichTextDoc, unknown> =
  boundedInput.pipe(docSchema);

/*
 * Base pieces other documents (the blog body) extend instead of duplicating: they add their own
 * node types on top and keep the same whitelist, depth and size limits.
 */
export const richTextBoundedInput: typeof boundedInput = boundedInput;
export const richTextInlineSchema: typeof inlineSchema = inlineSchema;
export const richTextParagraphSchema: typeof paragraphSchema = paragraphSchema;
export const richTextBlockSchema: typeof blockSchema = blockSchema;
