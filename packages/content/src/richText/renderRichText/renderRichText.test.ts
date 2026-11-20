import { describe, expect, test } from "bun:test";
import { renderRichText } from "./renderRichText";

const text = (value: string, marks?: unknown[]) => ({
  type: "text",
  text: value,
  ...(marks ? { marks } : {}),
});
const paragraph = (...content: unknown[]) => ({ type: "paragraph", content });
const doc = (...content: unknown[]) => ({ type: "doc", content });
const link = (href: unknown) => ({ type: "link", attrs: { href } });

describe("renderRichText: structure", () => {
  test("renders every supported node with semantic tags", () => {
    const html = renderRichText(
      doc(
        { type: "heading", attrs: { level: 2 }, content: [text("Title")] },
        { type: "heading", attrs: { level: 3 }, content: [text("Sub")] },
        paragraph(text("one"), { type: "hardBreak" }, text("two")),
        {
          type: "bulletList",
          content: [{ type: "listItem", content: [paragraph(text("a"))] }],
        },
        {
          type: "orderedList",
          content: [{ type: "listItem", content: [paragraph(text("b"))] }],
        },
        { type: "blockquote", content: [paragraph(text("quote"))] },
        { type: "horizontalRule" },
      ),
    );
    expect(html).toBe(
      "<h2>Title</h2><h3>Sub</h3><p>one<br>two</p>" +
        "<ul><li><p>a</p></li></ul><ol><li><p>b</p></li></ol>" +
        "<blockquote><p>quote</p></blockquote><hr>",
    );
  });

  test("applies bold, italic and link marks", () => {
    const html = renderRichText(
      doc(
        paragraph(
          text("x", [
            { type: "bold" },
            { type: "italic" },
            link("https://example.org/a?b=1&c=2"),
          ]),
        ),
      ),
    );
    expect(html).toBe(
      '<p><a href="https://example.org/a?b=1&amp;c=2" target="_blank" rel="noopener noreferrer"><em><strong>x</strong></em></a></p>',
    );
  });

  test("mailto links carry no target nor rel", () => {
    expect(
      renderRichText(doc(paragraph(text("mail", [link("mailto:a@b.org")])))),
    ).toBe('<p><a href="mailto:a@b.org">mail</a></p>');
  });

  test("an empty paragraph or list is still well formed", () => {
    expect(
      renderRichText(doc({ type: "paragraph" }, { type: "bulletList" })),
    ).toBe("<p></p><ul></ul>");
  });

  test("an out of range heading level falls back to h2", () => {
    expect(
      renderRichText(
        doc({ type: "heading", attrs: { level: 1 }, content: [text("x")] }),
      ),
    ).toBe("<h2>x</h2>");
    expect(
      renderRichText(
        doc({ type: "heading", attrs: { level: "3" }, content: [text("x")] }),
      ),
    ).toBe("<h2>x</h2>");
  });
});

describe("renderRichText: XSS", () => {
  test("escapes markup in text", () => {
    const html = renderRichText(
      doc(
        paragraph(text("<script>alert(1)</script>")),
        paragraph(text("<img src=x onerror=alert(1)>")),
        paragraph(text(`"quotes" & 'apostrophes'`)),
      ),
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain("&quot;quotes&quot; &amp; &#39;apostrophes&#39;");
  });

  test("quotes inside an href cannot break out of the attribute", () => {
    const html = renderRichText(
      doc(
        paragraph(
          text("x", [link('https://example.org/" onmouseover="alert(1)')]),
        ),
      ),
    );
    expect(html).toContain(
      'href="https://example.org/&quot; onmouseover=&quot;alert(1)"',
    );
    expect(html).not.toContain('" onmouseover');
  });

  test.each([
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "  javascript:alert(1)",
    "java\nscript:alert(1)",
    "java\tscript:alert(1)",
    "\u0000javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "//evil.example/x",
    "/relative",
    "",
  ])("a link to %j renders only its text", (href) => {
    const html = renderRichText(doc(paragraph(text("click", [link(href)]))));
    expect(html).toBe("<p>click</p>");
  });

  test("accepts a scheme in capitals and surrounding spaces", () => {
    const html = renderRichText(
      doc(paragraph(text("x", [link("  HTTPS://example.org  ")]))),
    );
    expect(html).toContain('href="HTTPS://example.org"');
  });

  test("a non string href renders the text without link", () => {
    expect(
      renderRichText(doc(paragraph(text("x", [link(42), { type: "link" }])))),
    ).toBe("<p>x</p>");
  });

  test("extra attributes on nodes and marks never reach the output", () => {
    const html = renderRichText({
      type: "doc",
      onclick: "alert(1)",
      content: [
        {
          type: "paragraph",
          onclick: "alert(1)",
          attrs: { class: "x", style: "color:red" },
          content: [
            {
              type: "text",
              text: "hi",
              onclick: "alert(1)",
              marks: [
                {
                  type: "link",
                  onclick: "alert(1)",
                  attrs: {
                    href: "https://example.org",
                    onclick: "alert(1)",
                    target: "_self",
                  },
                },
              ],
            },
          ],
        },
      ],
    });
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("style");
    expect(html).not.toContain("class");
    expect(html).not.toContain("_self");
  });

  test("unknown nodes and marks are dropped, not rendered", () => {
    const html = renderRichText(
      doc(
        { type: "iframe", attrs: { src: "https://evil.example" } },
        { type: "script", content: [paragraph(text("hidden"))] },
        paragraph(
          text("keep", [{ type: "highlight", attrs: { color: "red" } }]),
          { type: "image", attrs: { src: "x" } },
          { type: "paragraph", content: [text("nested block")] },
        ),
        { type: "listItem", content: [paragraph(text("orphan"))] },
      ),
    );
    expect(html).toBe("<p>keep</p>");
  });

  test("a list ignores children that are not list items", () => {
    const html = renderRichText(
      doc({
        type: "bulletList",
        content: [
          paragraph(text("loose")),
          { type: "listItem", content: [paragraph(text("ok"))] },
        ],
      }),
    );
    expect(html).toBe("<ul><li><p>ok</p></li></ul>");
  });

  test("a document nested far beyond the limit does not overflow the stack", () => {
    let node: unknown = paragraph(text("deep"));
    for (let level = 0; level < 100_000; level += 1) {
      node = { type: "blockquote", content: [node] };
    }
    const html = renderRichText(doc(node));
    expect(html).not.toContain("deep");
    expect(html.startsWith("<blockquote>")).toBe(true);
  });

  test("a document nested within the contract limit renders completely", () => {
    const html = renderRichText(
      doc({
        type: "blockquote",
        content: [
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "orderedList",
                    content: [
                      { type: "listItem", content: [paragraph(text("deep"))] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }),
    );
    expect(html).toContain("<p>deep</p>");
  });

  test.each([
    [null],
    [undefined],
    ["text"],
    [42],
    [[]],
    [{}],
    [{ type: "paragraph" }],
    [{ type: "doc" }],
    [{ type: "doc", content: "x" }],
  ])("an invalid document (%j) renders as an empty string", (input) => {
    expect(renderRichText(input)).toBe("");
  });

  test("malformed children are skipped without throwing", () => {
    const html = renderRichText({
      type: "doc",
      content: [
        null,
        7,
        "x",
        [],
        paragraph(null, 3, { type: "text", text: 5 }, text("ok")),
      ],
    });
    expect(html).toBe("<p>ok</p>");
  });

  test("does not read prototype properties as attributes or nodes", () => {
    expect(
      renderRichText(doc({ type: "__proto__" }, { type: "constructor" })),
    ).toBe("");
  });
});
