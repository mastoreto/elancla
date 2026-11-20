import { describe, expect, test } from "bun:test";
import { RICH_TEXT_MAX_DEPTH, RICH_TEXT_MAX_NODES } from "../../common";
import {
  blogRichTextDocSchema,
  publicBlogRichTextDocSchema,
} from "./blogRichText";

const MEDIA_ID = "0197f1a0-0000-7000-8000-000000000001";
const text = (value: string, marks?: unknown[]) => ({
  type: "text",
  text: value,
  ...(marks ? { marks } : {}),
});
const paragraph = (value: string) => ({
  type: "paragraph",
  content: [text(value)],
});
const doc = (...content: unknown[]) => ({ type: "doc", content });
const parses = (value: unknown) =>
  blogRichTextDocSchema.safeParse(value).success;

const allNodes = doc(
  { type: "heading", attrs: { level: 2 }, content: [text("Esperanza")] },
  { type: "paragraph", attrs: { dropCap: true }, content: [text("Hola")] },
  {
    type: "verse",
    attrs: { reference: "Hebreos 6:19" },
    content: [text("Esta esperanza")],
  },
  {
    type: "figure",
    attrs: { mediaId: MEDIA_ID, alt: "Un ancla", aspect: "wide" },
  },
  { type: "pullquote", attrs: { cite: "Agustín" }, content: [text("Cita")] },
  {
    type: "video",
    attrs: { youtubeId: "dQw4w9WgXcQ", title: "Video", caption: null },
  },
  { type: "note", attrs: { label: "Nota" }, content: [paragraph("Texto")] },
  {
    type: "linkCards",
    attrs: {
      items: [
        { title: "Recurso", href: "https://example.org/x", sourceLabel: "Org" },
      ],
    },
  },
  { type: "horizontalRule" },
  {
    type: "bulletList",
    content: [{ type: "listItem", content: [paragraph("a")] }],
  },
  { type: "blockquote", content: [paragraph("q")] },
);

describe("blogRichTextDocSchema", () => {
  test("accepts every node and keeps dropCap", () => {
    const parsed = blogRichTextDocSchema.parse(allNodes);
    expect(parsed.content).toHaveLength(11);
    expect(parsed.content[1]).toMatchObject({
      type: "paragraph",
      attrs: { dropCap: true },
    });
  });

  test("turns empty optional attributes into absent ones", () => {
    const parsed = blogRichTextDocSchema.parse(allNodes);
    const video = parsed.content[5] as { attrs: Record<string, unknown> };
    expect(video.attrs.caption).toBeUndefined();
  });

  test.each([
    "dQw4w9WgXc",
    "dQw4w9WgXcQQ",
    "https://youtu.be/dQw4w9WgXcQ",
    'dQw4w9"onload',
  ])("rejects the youtubeId %p", (youtubeId) => {
    expect(
      parses(doc({ type: "video", attrs: { youtubeId, title: "V" } })),
    ).toBe(false);
  });

  test.each([
    "javascript:alert(1)",
    "mailto:a@b.org",
    "//evil.org",
    "/relative",
    "ftp://x.org",
  ])("rejects the link card href %p", (href) => {
    const node = {
      type: "linkCards",
      attrs: { items: [{ title: "T", href }] },
    };
    expect(parses(doc(node))).toBe(false);
  });

  test("rejects a dangerous inline link inside a verse", () => {
    const evil = text("x", [
      { type: "link", attrs: { href: "javascript:alert(1)" } },
    ]);
    const verse = {
      type: "verse",
      attrs: { reference: "Sal 1" },
      content: [evil],
    };
    expect(parses(doc(verse))).toBe(false);
  });

  test("rejects unknown nodes, including the old reactions block", () => {
    expect(parses(doc({ type: "reactions" }))).toBe(false);
    expect(parses(doc({ type: "script", content: [] }))).toBe(false);
    expect(parses(doc({ type: "image", attrs: { src: "x" } }))).toBe(false);
  });

  test("bounds link cards to 1..6 items", () => {
    const item = { title: "T", href: "https://a.org" };
    const cards = (count: number) => ({
      type: "linkCards",
      attrs: { items: Array.from({ length: count }, () => item) },
    });
    expect(parses(doc(cards(6)))).toBe(true);
    expect(parses(doc(cards(7)))).toBe(false);
    expect(parses(doc(cards(0)))).toBe(false);
  });

  test("requires a valid media id and aspect in a figure", () => {
    const figure = (attrs: Record<string, unknown>) =>
      doc({ type: "figure", attrs });
    expect(parses(figure({ mediaId: "x", alt: "", aspect: "wide" }))).toBe(
      false,
    );
    expect(parses(figure({ mediaId: MEDIA_ID, alt: "", aspect: "tall" }))).toBe(
      false,
    );
    expect(parses(figure({ mediaId: MEDIA_ID, alt: "" }))).toBe(false);
  });

  test("requires a verse reference and a note label", () => {
    expect(parses(doc({ type: "verse", attrs: {}, content: [] }))).toBe(false);
    expect(
      parses(doc({ type: "note", attrs: { label: "" }, content: [] })),
    ).toBe(false);
  });

  test("keeps the depth and size limits of the base document", () => {
    let nested: unknown = paragraph("deep");
    for (let level = 0; level < RICH_TEXT_MAX_DEPTH + 5; level += 1) {
      nested = { type: "blockquote", content: [nested] };
    }
    expect(parses(doc(nested))).toBe(false);
    const many = Array.from({ length: RICH_TEXT_MAX_NODES }, () =>
      paragraph("x"),
    );
    expect(parses(doc(...many))).toBe(false);
  });
});

describe("publicBlogRichTextDocSchema", () => {
  test("accepts a figure resolved to an image and rejects the media id form", () => {
    const image = { url: "https://cdn/x.webp", width: 800, height: 400 };
    const resolved = doc({
      type: "figure",
      attrs: { image, alt: "A", aspect: "wide" },
    });
    expect(publicBlogRichTextDocSchema.safeParse(resolved).success).toBe(true);
    const raw = doc({
      type: "figure",
      attrs: { mediaId: MEDIA_ID, alt: "A", aspect: "wide" },
    });
    expect(publicBlogRichTextDocSchema.safeParse(raw).success).toBe(false);
  });
});
