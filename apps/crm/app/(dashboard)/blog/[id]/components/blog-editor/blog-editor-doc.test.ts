import { describe, expect, test } from "bun:test";
import { blogRichTextDocSchema } from "@ancla/contracts";
import { getSchema } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { blogExtensions } from "./extensions";

const MEDIA_ID = "0194f2a0-7c1e-7a3b-8f00-1d2e3c4b5a69";

// What a user can build with every button of the toolbar.
const authoredDoc = {
  type: "doc",
  content: [
    { type: "paragraph", attrs: { dropCap: true }, content: [{ type: "text", text: "Inicio." }] },
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Título" }] },
    {
      type: "verse",
      attrs: { reference: "Hebreos 11:1" },
      content: [{ type: "text", text: "Es, pues, la fe..." }],
    },
    { type: "figure", attrs: { mediaId: MEDIA_ID, alt: "Ancla", caption: null, aspect: "wide" } },
    { type: "pullquote", attrs: { cite: null }, content: [{ type: "text", text: "Firmes." }] },
    { type: "video", attrs: { youtubeId: "dQw4w9WgXcQ", title: "Prédica", caption: null } },
    {
      type: "note",
      attrs: { label: "Nota" },
      content: [{ type: "paragraph", content: [{ type: "text", text: "Detalle." }] }],
    },
    {
      type: "linkCards",
      attrs: {
        items: [
          { title: "Recurso", href: "https://example.com", description: null, sourceLabel: null },
        ],
      },
    },
    { type: "horizontalRule" },
  ],
};

describe("blog editor nodes", () => {
  const schema = getSchema([
    StarterKit.configure({ paragraph: false, heading: { levels: [2, 3] } }),
    ...blogExtensions,
  ]);

  test("the extensions define every blog node exactly once", () => {
    const names = Object.keys(schema.nodes);
    for (const name of [
      "paragraph",
      "verse",
      "figure",
      "pullquote",
      "video",
      "note",
      "linkCards",
    ]) {
      expect(names.filter((candidate) => candidate === name)).toHaveLength(1);
    }
  });

  test("a document with every node validates as the editor serializes it", () => {
    const emitted = schema.nodeFromJSON(authoredDoc).toJSON();
    const result = blogRichTextDocSchema.safeParse(emitted);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content.map((block) => block.type)).toEqual(
        authoredDoc.content.map((block) => block.type),
      );
    }
  });

  test("an empty paragraph serializes with a null drop cap, which the schema accepts", () => {
    const emitted = schema.nodeFromJSON({ type: "doc", content: [{ type: "paragraph" }] }).toJSON();
    expect(blogRichTextDocSchema.safeParse(emitted).success).toBe(true);
  });
});
