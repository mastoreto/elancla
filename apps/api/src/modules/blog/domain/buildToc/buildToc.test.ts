import { describe, expect, test } from "bun:test";
import { buildToc } from "./buildToc";

const heading = (level: number, text: string) => ({
  type: "heading",
  attrs: { level },
  content: [{ type: "text", text }],
});

describe("buildToc", () => {
  test("lists the h2 only, with accent-free ids", () => {
    const doc = {
      type: "doc",
      content: [heading(2, "Esperanza y ancla"), heading(3, "Detalle")],
    };
    expect(buildToc(doc)).toEqual([
      { id: "esperanza-y-ancla", text: "Esperanza y ancla" },
    ]);
  });

  test("repeated headings get numbered ids", () => {
    const doc = { type: "doc", content: [heading(2, "Fe"), heading(2, "Fe")] };
    expect(buildToc(doc).map((entry) => entry.id)).toEqual(["fe", "fe-2"]);
  });

  test("a document without headings has an empty table", () => {
    expect(buildToc({ type: "doc", content: [] })).toEqual([]);
  });
});
