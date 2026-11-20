import type { PublicBlogTocEntryDto } from "@ancla/contracts";
import { uniqueHeadingIds } from "@ancla/contracts";
import { collectHeadings, type RichTextNodeLike } from "../richTextNodes";

const TOC_HEADING_LEVEL = 2;

/**
 * Table of contents: the h2 of the body in document order. The ids come from the contracts'
 * `uniqueHeadingIds`, the same function the renderer uses, so every link finds its heading.
 */
export function buildToc(body: RichTextNodeLike): PublicBlogTocEntryDto[] {
  const texts = collectHeadings(body, TOC_HEADING_LEVEL);
  const ids = uniqueHeadingIds(texts);
  return texts.map((text, index) => ({ id: ids[index] ?? "", text }));
}
