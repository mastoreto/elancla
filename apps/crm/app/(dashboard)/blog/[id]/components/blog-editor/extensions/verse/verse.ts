import { mergeAttributes, Node } from "@tiptap/react";

/** A scripture quotation; `reference` is "Hebreos 11:1". Its text is inline content. */
export const Verse = Node.create({
  name: "verse",
  group: "block",
  content: "inline*",
  marks: "",
  defining: true,

  addAttributes() {
    return { reference: { default: "" } };
  },

  parseHTML() {
    return [{ tag: "blockquote[data-verse]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "blockquote",
      mergeAttributes(HTMLAttributes, { "data-verse": "", "data-reference": node.attrs.reference }),
      0,
    ];
  },
});
