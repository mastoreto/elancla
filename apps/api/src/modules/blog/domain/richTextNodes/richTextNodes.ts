/** The part of a rich text node the blog statistics read; any document of the contracts fits. */
export interface RichTextNodeLike {
  type: string;
  text?: string;
  attrs?: unknown;
  content?: readonly RichTextNodeLike[];
}

/** The plain text of a node: its own text plus its children's, in document order. */
export function collectText(node: RichTextNodeLike): string {
  if (typeof node.text === "string") return node.text;
  return (node.content ?? []).map(collectText).join("");
}

/** Every `level` heading of the document in order, at any depth, with its plain text. */
export function collectHeadings(
  node: RichTextNodeLike,
  level: number,
): string[] {
  const own =
    node.type === "heading" &&
    (node.attrs as { level?: number } | undefined)?.level === level
      ? [collectText(node)]
      : [];
  return [
    ...own,
    ...(node.content ?? []).flatMap((child) => collectHeadings(child, level)),
  ];
}
