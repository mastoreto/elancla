import { describe, expect, test } from "bun:test";
import { renderBlogBody } from "./renderBlogBody";

const text = (value: string, marks?: unknown[]) => ({
  type: "text",
  text: value,
  ...(marks ? { marks } : {}),
});
const paragraph = (...content: unknown[]) => ({ type: "paragraph", content });
const heading = (value: string, level = 2) => ({
  type: "heading",
  attrs: { level },
  content: [text(value)],
});
const doc = (...content: unknown[]) => ({ type: "doc", content });
const YOUTUBE_ID = "dQw4w9WgXcQ";
const IMAGE = {
  url: "https://cdn.example.org/a.webp",
  width: 1200,
  height: 800,
};

describe("renderBlogBody: one case per node", () => {
  test("a paragraph with drop cap carries its class, a plain one does not", () => {
    const html = renderBlogBody(
      doc(
        { type: "paragraph", attrs: { dropCap: true }, content: [text("A")] },
        { type: "paragraph", attrs: { dropCap: false }, content: [text("B")] },
        paragraph(text("C")),
      ),
    );
    expect(html).toBe('<p class="blog-dropcap">A</p><p>B</p><p>C</p>');
  });

  test("h2 gets an id for the table of contents, h3 does not", () => {
    const html = renderBlogBody(
      doc(heading("Esperanza y ancla"), heading("Sub", 3)),
    );
    expect(html).toBe(
      '<h2 id="esperanza-y-ancla">Esperanza y ancla</h2><h3>Sub</h3>',
    );
  });

  test("repeated headings get -2, -3 like the table of contents", () => {
    const html = renderBlogBody(
      doc(heading("Fe"), heading("Fe"), heading("Fe")),
    );
    expect(html).toContain('id="fe"');
    expect(html).toContain('id="fe-2"');
    expect(html).toContain('id="fe-3"');
  });

  test("a heading inside a quote still takes its turn in the ids", () => {
    const html = renderBlogBody(
      doc({ type: "blockquote", content: [heading("Fe")] }, heading("Fe")),
    );
    expect(html).toBe(
      '<blockquote><h2 id="fe">Fe</h2></blockquote><h2 id="fe-2">Fe</h2>',
    );
  });

  test("verse renders its text and reference", () => {
    const html = renderBlogBody(
      doc({
        type: "verse",
        attrs: { reference: "Hebreos 6:19" },
        content: [text("Una segura y firme ancla")],
      }),
    );
    expect(html).toBe(
      '<blockquote class="blog-verse"><p class="blog-verse-text">Una segura y firme ancla</p><cite class="blog-verse-reference">Hebreos 6:19</cite></blockquote>',
    );
  });

  test("pull quote renders with and without cite", () => {
    const html = renderBlogBody(
      doc(
        { type: "pullquote", attrs: { cite: "Autor" }, content: [text("Q1")] },
        { type: "pullquote", content: [text("Q2")] },
      ),
    );
    expect(html).toBe(
      '<blockquote class="blog-pullquote"><p class="blog-pullquote-text">Q1</p><cite class="blog-pullquote-cite">Autor</cite></blockquote>' +
        '<blockquote class="blog-pullquote"><p class="blog-pullquote-text">Q2</p></blockquote>',
    );
  });

  test("figure renders the image with size, lazy loading and caption", () => {
    const html = renderBlogBody(
      doc({
        type: "figure",
        attrs: {
          image: IMAGE,
          alt: "Una ancla",
          caption: "Pie",
          aspect: "wide",
        },
      }),
    );
    expect(html).toBe(
      '<figure class="blog-figure blog-figure-wide"><div class="blog-figure-frame">' +
        '<img class="blog-figure-image" src="https://cdn.example.org/a.webp" alt="Una ancla" width="1200" height="800" loading="lazy" decoding="async"></div>' +
        '<figcaption class="blog-figure-caption">Pie</figcaption></figure>',
    );
  });

  test("a figure without a usable image is left out", () => {
    const html = renderBlogBody(
      doc(
        { type: "figure", attrs: { alt: "x", aspect: "wide" } },
        {
          type: "figure",
          attrs: {
            image: { url: "javascript:alert(1)", width: 1, height: 1 },
            alt: "x",
          },
        },
        { type: "figure", attrs: { image: { ...IMAGE, width: 0 }, alt: "x" } },
        {
          type: "figure",
          attrs: { mediaId: "7f3f6b5e-0000-4000-8000-000000000000", alt: "x" },
        },
      ),
    );
    expect(html).toBe("");
  });

  test("an unknown aspect falls back to landscape", () => {
    const html = renderBlogBody(
      doc({
        type: "figure",
        attrs: { image: IMAGE, alt: "", aspect: 'x" onload="1' },
      }),
    );
    expect(html).toContain("blog-figure-landscape");
    expect(html).not.toContain("onload");
  });

  test("video is a youtube-nocookie iframe, lazy and titled", () => {
    const html = renderBlogBody(
      doc({
        type: "video",
        attrs: { youtubeId: YOUTUBE_ID, title: "Sermón", caption: "Pie" },
      }),
    );
    expect(html).toContain(
      `<iframe src="https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}" title="Sermón" loading="lazy"`,
    );
    expect(html).toContain(
      '<figcaption class="blog-video-caption">Pie</figcaption>',
    );
    expect(html).not.toContain("youtube.com/embed");
  });

  test("note renders its label and paragraphs", () => {
    const html = renderBlogBody(
      doc({
        type: "note",
        attrs: { label: "Nota" },
        content: [
          paragraph(text("uno")),
          paragraph(text("dos", [{ type: "bold" }])),
        ],
      }),
    );
    expect(html).toBe(
      '<aside class="blog-note"><span class="blog-note-label">Nota</span><p>uno</p><p><strong>dos</strong></p></aside>',
    );
  });

  test("link cards render external links with title, description and source", () => {
    const html = renderBlogBody(
      doc({
        type: "linkCards",
        attrs: {
          items: [
            {
              title: "Recurso",
              description: "Desc",
              href: "https://example.org/a?b=1&c=2",
              sourceLabel: "Fuente",
            },
          ],
        },
      }),
    );
    expect(html).toBe(
      '<div class="blog-links"><a class="blog-link-card" href="https://example.org/a?b=1&amp;c=2" target="_blank" rel="noopener noreferrer">' +
        '<b class="blog-link-title">Recurso</b><span class="blog-link-description">Desc</span><span class="blog-link-source">Fuente</span></a></div>',
    );
  });

  test("the page nodes still render: lists, quote, rule, marks", () => {
    const html = renderBlogBody(
      doc(
        {
          type: "bulletList",
          content: [{ type: "listItem", content: [paragraph(text("a"))] }],
        },
        { type: "blockquote", content: [paragraph(text("q"))] },
        { type: "horizontalRule" },
      ),
    );
    expect(html).toBe(
      "<ul><li><p>a</p></li></ul><blockquote><p>q</p></blockquote><hr>",
    );
  });
});

describe("renderBlogBody: XSS", () => {
  test("markup in text and in every attribute is escaped", () => {
    const evil = "<script>alert(1)</script>\"'";
    const html = renderBlogBody(
      doc(
        paragraph(text(evil)),
        heading(evil),
        { type: "verse", attrs: { reference: evil }, content: [text(evil)] },
        { type: "pullquote", attrs: { cite: evil }, content: [text(evil)] },
        { type: "figure", attrs: { image: IMAGE, alt: evil, caption: evil } },
        {
          type: "video",
          attrs: { youtubeId: YOUTUBE_ID, title: evil, caption: evil },
        },
        {
          type: "note",
          attrs: { label: evil },
          content: [paragraph(text(evil))],
        },
        {
          type: "linkCards",
          attrs: {
            items: [
              {
                title: evil,
                description: evil,
                sourceLabel: evil,
                href: "https://example.org/",
              },
            ],
          },
        },
      ),
    );
    expect(html).not.toContain("<script");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  test.each([
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "java\nscript:alert(1)",
    "mailto:a@b.org",
    "data:text/html,<script>alert(1)</script>",
    "//evil.example/x",
    "/relative",
    "",
  ])("a link card to %j is dropped", (href) => {
    const html = renderBlogBody(
      doc({ type: "linkCards", attrs: { items: [{ title: "x", href }] } }),
    );
    expect(html).toBe("");
  });

  test("a javascript: link mark renders only the text", () => {
    const html = renderBlogBody(
      doc(
        paragraph(
          text("click", [
            { type: "link", attrs: { href: "javascript:alert(1)" } },
          ]),
        ),
      ),
    );
    expect(html).toBe("<p>click</p>");
  });

  test("link cards beyond the limit are not rendered", () => {
    const items = Array.from({ length: 10 }, (_, index) => ({
      title: `T${index}`,
      href: "https://example.org/",
    }));
    const html = renderBlogBody(doc({ type: "linkCards", attrs: { items } }));
    expect(html.match(/blog-link-card/g)?.length).toBe(6);
  });

  test.each([
    "dQw4w9WgXc",
    "dQw4w9WgXcQQ",
    'dQw4w9WgXc"',
    "https://evil.example/x",
    '"><script>alert(1)</script>',
    "",
    42,
    null,
  ])("a video with the odd id %j is dropped", (youtubeId) => {
    const html = renderBlogBody(
      doc({ type: "video", attrs: { youtubeId, title: "x" } }),
    );
    expect(html).toBe("");
  });

  test("an unknown node is ignored, also inside a note or a quote", () => {
    const html = renderBlogBody(
      doc(
        { type: "reactions", attrs: { prompt: "x" } },
        { type: "iframe", attrs: { src: "https://evil.example" } },
        { type: "script", content: [paragraph(text("hidden"))] },
        {
          type: "note",
          attrs: { label: "n" },
          content: [{ type: "iframe" }, paragraph(text("ok"))],
        },
        paragraph(text("keep")),
      ),
    );
    expect(html).toBe(
      '<aside class="blog-note"><span class="blog-note-label">n</span><p>ok</p></aside><p>keep</p>',
    );
  });

  test("the blog nodes are top level only: nested ones are dropped", () => {
    const html = renderBlogBody(
      doc({
        type: "blockquote",
        content: [
          { type: "video", attrs: { youtubeId: YOUTUBE_ID, title: "x" } },
          { type: "paragraph", attrs: { dropCap: true }, content: [text("p")] },
        ],
      }),
    );
    expect(html).toBe("<blockquote><p>p</p></blockquote>");
  });

  test.each([
    [null],
    [undefined],
    ["text"],
    [{}],
    [{ type: "doc" }],
  ])("an invalid document (%j) renders as an empty string", (input) => {
    expect(renderBlogBody(input)).toBe("");
  });

  test("renders are independent: heading ids restart for every document", () => {
    const body = doc(heading("Fe"));
    expect(renderBlogBody(body)).toBe(renderBlogBody(body));
    expect(renderBlogBody(body)).toContain('id="fe"');
  });
});
