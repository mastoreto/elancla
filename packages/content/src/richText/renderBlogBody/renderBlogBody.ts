import {
  BLOG_FIGURE_ASPECTS,
  BLOG_LINK_CARD_HREF_PATTERN,
  BLOG_LINK_CARDS_MAX_ITEMS,
  headingId,
  YOUTUBE_ID_PATTERN,
} from "@ancla/contracts";
import {
  childrenOf,
  type Dict,
  escapeHtml,
  externalLinkAttributes,
  isDict,
  plainTextOf,
  type RenderHooks,
  renderDocument,
  renderInlines,
  safeUrl,
} from "../htmlDocument";

/*
 * The blog body is the page document plus the blog's own nodes. They come from the public API:
 * the figure carries `image` (the media id was already resolved there). The classes (`blog-*`) are
 * the styling contract with the web (`BlogArticleBody` styles the markup from its container).
 */

const YOUTUBE_EMBED_URL = "https://www.youtube-nocookie.com/embed/";
const DEFAULT_VIDEO_TITLE = "YouTube";
const DEFAULT_FIGURE_ASPECT = "landscape";
const IMAGE_URL = /^(https?:\/\/|\/(?!\/))/i;
const VIDEO_ALLOW = "encrypted-media; picture-in-picture; fullscreen";

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function attrsOf(node: Dict): Dict {
  return isDict(node.attrs) ? node.attrs : {};
}

function optionalElement(
  tag: string,
  className: string,
  value: unknown,
): string {
  const content = text(value);
  return content
    ? `<${tag} class="${className}">${escapeHtml(content)}</${tag}>`
    : "";
}

function renderParagraph(node: Dict): string {
  const dropCap = attrsOf(node).dropCap === true;
  const open = dropCap ? '<p class="blog-dropcap">' : "<p>";
  return `${open}${renderInlines(node)}</p>`;
}

function renderVerse(node: Dict): string {
  const reference = optionalElement(
    "cite",
    "blog-verse-reference",
    attrsOf(node).reference,
  );
  return `<blockquote class="blog-verse"><p class="blog-verse-text">${renderInlines(node)}</p>${reference}</blockquote>`;
}

function renderPullquote(node: Dict): string {
  const cite = optionalElement(
    "cite",
    "blog-pullquote-cite",
    attrsOf(node).cite,
  );
  return `<blockquote class="blog-pullquote"><p class="blog-pullquote-text">${renderInlines(node)}</p>${cite}</blockquote>`;
}

function positiveInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function renderFigure(node: Dict): string {
  const attrs = attrsOf(node);
  const image = isDict(attrs.image) ? attrs.image : null;
  const src = image ? safeUrl(image.url, IMAGE_URL) : null;
  const width = positiveInteger(image?.width);
  const height = positiveInteger(image?.height);
  // A figure without a usable image has nothing to show: it is left out, not drawn empty.
  if (!src || !width || !height) return "";
  const aspect =
    BLOG_FIGURE_ASPECTS.find((candidate) => candidate === attrs.aspect) ??
    DEFAULT_FIGURE_ASPECT;
  const alt = typeof attrs.alt === "string" ? attrs.alt : "";
  const caption = optionalElement(
    "figcaption",
    "blog-figure-caption",
    attrs.caption,
  );
  return (
    `<figure class="blog-figure blog-figure-${aspect}">` +
    `<div class="blog-figure-frame"><img class="blog-figure-image" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async"></div>` +
    `${caption}</figure>`
  );
}

function renderVideo(node: Dict): string {
  const attrs = attrsOf(node);
  const id = typeof attrs.youtubeId === "string" ? attrs.youtubeId : "";
  if (!YOUTUBE_ID_PATTERN.test(id)) return "";
  const title = text(attrs.title) ?? DEFAULT_VIDEO_TITLE;
  const caption = optionalElement(
    "figcaption",
    "blog-video-caption",
    attrs.caption,
  );
  return (
    `<figure class="blog-video"><div class="blog-video-frame">` +
    `<iframe src="${YOUTUBE_EMBED_URL}${id}" title="${escapeHtml(title)}" loading="lazy" allow="${VIDEO_ALLOW}" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>` +
    `</div>${caption}</figure>`
  );
}

function renderNote(node: Dict): string {
  const label = optionalElement("span", "blog-note-label", attrsOf(node).label);
  const paragraphs = childrenOf(node)
    .filter(
      (child): child is Dict => isDict(child) && child.type === "paragraph",
    )
    .map((paragraph) => `<p>${renderInlines(paragraph)}</p>`)
    .join("");
  return `<aside class="blog-note">${label}${paragraphs}</aside>`;
}

function renderLinkCard(item: unknown): string {
  if (!isDict(item)) return "";
  const href = safeUrl(item.href, BLOG_LINK_CARD_HREF_PATTERN);
  const title = text(item.title);
  if (!href || !title) return "";
  return (
    `<a class="blog-link-card" href="${escapeHtml(href)}"${externalLinkAttributes(href)}>` +
    `<b class="blog-link-title">${escapeHtml(title)}</b>` +
    `${optionalElement("span", "blog-link-description", item.description)}` +
    `${optionalElement("span", "blog-link-source", item.sourceLabel)}</a>`
  );
}

function renderLinkCards(node: Dict): string {
  const items = attrsOf(node).items;
  if (!Array.isArray(items)) return "";
  const cards = items
    .slice(0, BLOG_LINK_CARDS_MAX_ITEMS)
    .map(renderLinkCard)
    .join("");
  return cards ? `<div class="blog-links">${cards}</div>` : "";
}

/** Hooks of one render: the heading ids are unique within the document, so they carry state. */
function createBlogHooks(): RenderHooks {
  const headingsSeen = new Map<string, number>();

  // The same dedupe as `uniqueHeadingIds` (`-2`, `-3`...), so the API's table of contents links match.
  function uniqueId(heading: Dict): string {
    const base = headingId(plainTextOf(heading));
    const count = (headingsSeen.get(base) ?? 0) + 1;
    headingsSeen.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  }

  return {
    renderBlock(node, depth) {
      // The blog's own nodes are top level only (the contract); deeper ones are dropped.
      const topLevel = depth === 1;
      switch (node.type) {
        case "paragraph":
          return topLevel ? renderParagraph(node) : null;
        case "heading": {
          if (attrsOf(node).level === 3) return null;
          return `<h2 id="${escapeHtml(uniqueId(node))}">${renderInlines(node)}</h2>`;
        }
        case "verse":
          return topLevel ? renderVerse(node) : "";
        case "pullquote":
          return topLevel ? renderPullquote(node) : "";
        case "figure":
          return topLevel ? renderFigure(node) : "";
        case "video":
          return topLevel ? renderVideo(node) : "";
        case "note":
          return topLevel ? renderNote(node) : "";
        case "linkCards":
          return topLevel ? renderLinkCards(node) : "";
        default:
          return null;
      }
    },
  };
}

/**
 * HTML for the body of a blog post (the `body` of `GET posts/:slug`): the page nodes plus
 * paragraph with drop cap, verse, figure, pull quote, video, note and link cards. Every `h2` gets
 * an `id` (`headingId` of the contracts) for the table of contents. Anything that is not a valid
 * `doc` renders as an empty string; unknown nodes are dropped. Meant for `set:html`.
 */
export function renderBlogBody(doc: unknown): string {
  return renderDocument(doc, createBlogHooks());
}
