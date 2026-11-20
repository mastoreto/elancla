import { describe, expect, test } from "bun:test";
import { collectHeadings, collectText } from "./richTextNodes";

const doc = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [
        { type: "text", text: "Uno " },
        { type: "text", text: "dos" },
      ],
    },
    {
      type: "blockquote",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Anidado" }],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Menor" }],
    },
  ],
};

describe("richTextNodes", () => {
  test("collectText joins the text of the children in order", () => {
    expect(collectText(doc)).toBe("Uno dosAnidadoMenor");
  });

  test("collectHeadings returns the headings of a level at any depth", () => {
    expect(collectHeadings(doc, 2)).toEqual(["Uno dos", "Anidado"]);
    expect(collectHeadings(doc, 3)).toEqual(["Menor"]);
  });
});
