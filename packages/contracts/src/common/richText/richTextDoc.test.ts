import { describe, expect, test } from "bun:test";
import {
  RICH_TEXT_MAX_DEPTH,
  RICH_TEXT_MAX_NODES,
  richTextDocSchema,
} from "./richTextDoc";

const paragraph = (text: string, marks?: unknown[]) => ({
  type: "paragraph",
  content: [{ type: "text", text, ...(marks ? { marks } : {}) }],
});
const doc = (...content: unknown[]) => ({ type: "doc", content });

describe("richTextDocSchema", () => {
  test("accepts every whitelisted node and mark", () => {
    const input = doc(
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "T" }],
      },
      paragraph("hi", [{ type: "bold" }, { type: "italic" }]),
      paragraph("link", [{ type: "link", attrs: { href: "https://a.org/x" } }]),
      paragraph("mail", [{ type: "link", attrs: { href: "mailto:a@b.org" } }]),
      { type: "horizontalRule" },
      { type: "blockquote", content: [paragraph("q")] },
      {
        type: "bulletList",
        content: [{ type: "listItem", content: [paragraph("a")] }],
      },
      {
        type: "orderedList",
        content: [{ type: "listItem", content: [paragraph("b")] }],
      },
      { type: "paragraph", content: [{ type: "hardBreak" }] },
      { type: "paragraph" },
    );
    expect(richTextDocSchema.safeParse(input).success).toBe(true);
  });

  test("strips attributes the renderer does not understand", () => {
    const input = doc(
      paragraph("x", [
        {
          type: "link",
          attrs: {
            href: "https://a.org",
            target: "_blank",
            rel: "x",
            class: "y",
          },
        },
      ]),
    );
    const parsed = richTextDocSchema.parse(input);
    expect(JSON.stringify(parsed)).not.toContain("target");
    expect(JSON.stringify(parsed)).not.toContain("class");
  });

  test.each([
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    " javascript:alert(1)",
    "data:text/html,<script>",
    "vbscript:x",
    "//evil.org",
    "/relative",
  ])("rejects the href %p", (href) => {
    const input = doc(paragraph("x", [{ type: "link", attrs: { href } }]));
    expect(richTextDocSchema.safeParse(input).success).toBe(false);
  });

  test("rejects unknown nodes and marks", () => {
    expect(
      richTextDocSchema.safeParse(doc({ type: "script", content: [] })).success,
    ).toBe(false);
    expect(
      richTextDocSchema.safeParse(doc({ type: "image", attrs: { src: "x" } }))
        .success,
    ).toBe(false);
    expect(
      richTextDocSchema.safeParse(doc(paragraph("x", [{ type: "underline" }])))
        .success,
    ).toBe(false);
  });

  test("rejects heading levels outside 2-3 and a document that is not a doc", () => {
    expect(
      richTextDocSchema.safeParse(
        doc({ type: "heading", attrs: { level: 1 }, content: [] }),
      ).success,
    ).toBe(false);
    expect(richTextDocSchema.safeParse({ type: "paragraph" }).success).toBe(
      false,
    );
    expect(richTextDocSchema.safeParse("text").success).toBe(false);
    expect(richTextDocSchema.safeParse(null).success).toBe(false);
  });

  test("rejects a document nested too deeply without overflowing the stack", () => {
    let nested: unknown = paragraph("deep");
    for (let level = 0; level < RICH_TEXT_MAX_DEPTH + 5; level += 1) {
      nested = { type: "blockquote", content: [nested] };
    }
    expect(richTextDocSchema.safeParse(doc(nested)).success).toBe(false);

    let hostile: unknown = { type: "paragraph" };
    for (let level = 0; level < 50_000; level += 1) {
      hostile = { type: "blockquote", content: [hostile] };
    }
    expect(richTextDocSchema.safeParse(doc(hostile)).success).toBe(false);
  });

  test("rejects too many nodes and too much text", () => {
    const many = Array.from({ length: RICH_TEXT_MAX_NODES }, () =>
      paragraph("x"),
    );
    expect(richTextDocSchema.safeParse(doc(...many)).success).toBe(false);

    const long = Array.from({ length: 6 }, () => paragraph("x".repeat(9_000)));
    expect(richTextDocSchema.safeParse(doc(...long)).success).toBe(false);
    expect(
      richTextDocSchema.safeParse(doc(paragraph("x".repeat(10_001)))).success,
    ).toBe(false);
  });

  test("rejects an empty text node", () => {
    expect(
      richTextDocSchema.safeParse(
        doc({ type: "paragraph", content: [{ type: "text", text: "" }] }),
      ).success,
    ).toBe(false);
  });
});
