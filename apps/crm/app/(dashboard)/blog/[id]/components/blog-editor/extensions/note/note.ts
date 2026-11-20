import { mergeAttributes, Node } from "@tiptap/react";

/** A labelled aside ("Nota", "Para reflexionar") that holds paragraphs. */
export const Note = Node.create({
  name: "note",
  group: "block",
  content: "paragraph+",
  defining: true,

  addAttributes() {
    return { label: { default: "" } };
  },

  parseHTML() {
    return [{ tag: "aside[data-note]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "aside",
      mergeAttributes(HTMLAttributes, { "data-note": "", "data-label": node.attrs.label }),
      0,
    ];
  },
});
