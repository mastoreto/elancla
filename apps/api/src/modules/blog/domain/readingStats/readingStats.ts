import { collectText, type RichTextNodeLike } from "../richTextNodes";

export const WORDS_PER_MINUTE = 200;

export interface ReadingStats {
  wordCount: number;
  /** Words / 200 rounded up, never less than 1. */
  readingMinutes: number;
}

/** Counts every word of the body (verses, quotes and notes included; attributes are not text). */
export function readingStats(body: RichTextNodeLike): ReadingStats {
  const words = collectText(spaced(body)).split(/\s+/).filter(Boolean);
  return {
    wordCount: words.length,
    readingMinutes: Math.max(1, Math.ceil(words.length / WORDS_PER_MINUTE)),
  };
}

/** Blocks are separate words even when the document stores no whitespace between them. */
function spaced(node: RichTextNodeLike): RichTextNodeLike {
  if (typeof node.text === "string") return node;
  return {
    ...node,
    content: (node.content ?? []).flatMap((child, index) =>
      index === 0 || child.type === "text"
        ? [spaced(child)]
        : [{ type: "text", text: " " }, spaced(child)],
    ),
  };
}
