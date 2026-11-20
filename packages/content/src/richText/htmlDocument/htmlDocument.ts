// Tiptap JSON -> HTML, safe by construction: only the nodes and marks below produce tags, every
// text and attribute is escaped, and anything else is dropped. It does not trust that the API
// validated the document, so the input is `unknown` and every access is checked.
// `renderRichText` (pages) uses it as is; `renderBlogBody` adds the blog's own nodes through
// `RenderHooks`, so the base rules (escaping, link whitelist, depth limit) live in one place.

/** The contract allows 10; a little above so a valid document is never cut, but never unbounded. */
const MAX_DEPTH = 12;
const SAFE_HREF = /^(https?:|mailto:)/i;
const EXTERNAL_HREF = /^https?:/i;
const LAST_CONTROL_CHARACTER = 0x1f;
const DELETE_CHARACTER = 0x7f;

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export type Dict = Record<string, unknown>;

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

export function isDict(value: unknown): value is Dict {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function childrenOf(node: Dict): unknown[] {
  return Array.isArray(node.content) ? node.content : [];
}

// Browsers drop control characters inside a scheme (`java\nscript:`), so they are refused.
function hasControlCharacters(value: string): boolean {
  return [...value].some((character) => {
    const code = character.charCodeAt(0);
    return code <= LAST_CONTROL_CHARACTER || code === DELETE_CHARACTER;
  });
}

/** `value` trimmed when it is a string that matches `scheme` and carries no control characters. */
export function safeUrl(value: unknown, scheme: RegExp): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (hasControlCharacters(trimmed) || !scheme.test(trimmed)) return null;
  return trimmed;
}

/** Attributes of an external link: opened in a new tab without leaking the opener. */
export function externalLinkAttributes(href: string): string {
  return EXTERNAL_HREF.test(href)
    ? ' target="_blank" rel="noopener noreferrer"'
    : "";
}

function safeHref(mark: Dict): string | null {
  return safeUrl(isDict(mark.attrs) ? mark.attrs.href : null, SAFE_HREF);
}

function wrapWithMarks(html: string, marks: unknown): string {
  if (!Array.isArray(marks)) return html;
  let result = html;
  let linked = false;
  for (const mark of marks) {
    if (!isDict(mark)) continue;
    if (mark.type === "bold") result = `<strong>${result}</strong>`;
    else if (mark.type === "italic") result = `<em>${result}</em>`;
    else if (mark.type === "link" && !linked) {
      const href = safeHref(mark);
      if (!href) continue;
      linked = true;
      result = `<a href="${escapeHtml(href)}"${externalLinkAttributes(href)}>${result}</a>`;
    }
  }
  return result;
}

function renderInline(node: unknown): string {
  if (!isDict(node)) return "";
  if (node.type === "hardBreak") return "<br>";
  if (node.type !== "text" || typeof node.text !== "string") return "";
  return wrapWithMarks(escapeHtml(node.text), node.marks);
}

/** The inline content (text, marks, hard breaks) of a block node. */
export function renderInlines(node: Dict): string {
  return childrenOf(node).map(renderInline).join("");
}

/** The text of a block's inline content without any markup (heading ids). */
export function plainTextOf(node: Dict): string {
  return childrenOf(node)
    .map((child) =>
      isDict(child) && child.type === "text" && typeof child.text === "string"
        ? child.text
        : "",
    )
    .join("");
}

export interface RenderHooks {
  /**
   * Renders a block before the base rules do: return its HTML, or `null` to let the base render
   * it. `depth` is 1 for the blocks directly under the document.
   */
  renderBlock?: (node: Dict, depth: number) => string | null;
}

function renderList(
  tag: "ul" | "ol",
  node: Dict,
  depth: number,
  hooks: RenderHooks,
): string {
  const items = childrenOf(node)
    .filter(
      (child): child is Dict => isDict(child) && child.type === "listItem",
    )
    .map((item) => `<li>${renderBlocks(item, depth + 1, hooks)}</li>`);
  return `<${tag}>${items.join("")}</${tag}>`;
}

function renderBlock(node: unknown, depth: number, hooks: RenderHooks): string {
  if (!isDict(node) || depth > MAX_DEPTH) return "";
  const custom = hooks.renderBlock?.(node, depth);
  if (custom != null) return custom;
  switch (node.type) {
    case "paragraph":
      return `<p>${renderInlines(node)}</p>`;
    case "heading": {
      const level = isDict(node.attrs) && node.attrs.level === 3 ? 3 : 2;
      return `<h${level}>${renderInlines(node)}</h${level}>`;
    }
    case "bulletList":
      return renderList("ul", node, depth, hooks);
    case "orderedList":
      return renderList("ol", node, depth, hooks);
    case "blockquote":
      return `<blockquote>${renderBlocks(node, depth + 1, hooks)}</blockquote>`;
    case "horizontalRule":
      return "<hr>";
    default:
      return "";
  }
}

function renderBlocks(node: Dict, depth: number, hooks: RenderHooks): string {
  return childrenOf(node)
    .map((child) => renderBlock(child, depth, hooks))
    .join("");
}

/**
 * HTML for a rich text document. Anything that is not a valid `doc` renders as an empty string.
 * The output is meant for `set:html`: it is the only place that markup is built.
 */
export function renderDocument(doc: unknown, hooks: RenderHooks = {}): string {
  if (!isDict(doc) || doc.type !== "doc") return "";
  return renderBlocks(doc, 1, hooks);
}
