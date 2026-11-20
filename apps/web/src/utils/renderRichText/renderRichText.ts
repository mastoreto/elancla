// Tiptap JSON -> HTML, safe by construction: only the nodes and marks below produce tags, every
// text and attribute is escaped, and anything else is dropped. It does not trust that the API
// validated the document, so the input is `unknown` and every access is checked.

/** The contract allows 10; a little above so a valid document is never cut, but never unbounded. */
const MAX_DEPTH = 12;
const SAFE_HREF = /^(https?:|mailto:)/i;
const LAST_CONTROL_CHARACTER = 0x1f;
const DELETE_CHARACTER = 0x7f;
const EXTERNAL_HREF = /^https?:/i;

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

type Dict = Record<string, unknown>;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

function isDict(value: unknown): value is Dict {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function childrenOf(node: Dict): unknown[] {
  return Array.isArray(node.content) ? node.content : [];
}

// Browsers drop control characters inside a scheme (`java\nscript:`), so they are refused.
function hasControlCharacters(value: string): boolean {
  return [...value].some((character) => {
    const code = character.charCodeAt(0);
    return code <= LAST_CONTROL_CHARACTER || code === DELETE_CHARACTER;
  });
}

function safeHref(mark: Dict): string | null {
  const href = isDict(mark.attrs) ? mark.attrs.href : null;
  if (typeof href !== 'string') return null;
  const trimmed = href.trim();
  if (hasControlCharacters(trimmed) || !SAFE_HREF.test(trimmed)) return null;
  return trimmed;
}

function wrapWithMarks(html: string, marks: unknown): string {
  if (!Array.isArray(marks)) return html;
  let result = html;
  let linked = false;
  for (const mark of marks) {
    if (!isDict(mark)) continue;
    if (mark.type === 'bold') result = `<strong>${result}</strong>`;
    else if (mark.type === 'italic') result = `<em>${result}</em>`;
    else if (mark.type === 'link' && !linked) {
      const href = safeHref(mark);
      if (!href) continue;
      linked = true;
      const rel = EXTERNAL_HREF.test(href)
        ? ' target="_blank" rel="noopener noreferrer"'
        : '';
      result = `<a href="${escapeHtml(href)}"${rel}>${result}</a>`;
    }
  }
  return result;
}

function renderInline(node: unknown): string {
  if (!isDict(node)) return '';
  if (node.type === 'hardBreak') return '<br>';
  if (node.type !== 'text' || typeof node.text !== 'string') return '';
  return wrapWithMarks(escapeHtml(node.text), node.marks);
}

function renderInlines(node: Dict): string {
  return childrenOf(node).map(renderInline).join('');
}

function renderList(tag: 'ul' | 'ol', node: Dict, depth: number): string {
  const items = childrenOf(node)
    .filter(
      (child): child is Dict => isDict(child) && child.type === 'listItem'
    )
    .map((item) => `<li>${renderBlocks(item, depth + 1)}</li>`);
  return `<${tag}>${items.join('')}</${tag}>`;
}

function renderBlock(node: unknown, depth: number): string {
  if (!isDict(node) || depth > MAX_DEPTH) return '';
  switch (node.type) {
    case 'paragraph':
      return `<p>${renderInlines(node)}</p>`;
    case 'heading': {
      const level = isDict(node.attrs) && node.attrs.level === 3 ? 3 : 2;
      return `<h${level}>${renderInlines(node)}</h${level}>`;
    }
    case 'bulletList':
      return renderList('ul', node, depth);
    case 'orderedList':
      return renderList('ol', node, depth);
    case 'blockquote':
      return `<blockquote>${renderBlocks(node, depth + 1)}</blockquote>`;
    case 'horizontalRule':
      return '<hr>';
    default:
      return '';
  }
}

function renderBlocks(node: Dict, depth: number): string {
  return childrenOf(node)
    .map((child) => renderBlock(child, depth))
    .join('');
}

/**
 * HTML for a rich text document. Anything that is not a valid `doc` renders as an empty string.
 * The output is meant for `set:html`: it is the only place that markup is built.
 */
export function renderRichText(doc: unknown): string {
  if (!isDict(doc) || doc.type !== 'doc') return '';
  return renderBlocks(doc, 1);
}
