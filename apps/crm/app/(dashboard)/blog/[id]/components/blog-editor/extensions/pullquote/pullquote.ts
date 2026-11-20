import { mergeAttributes, Node } from "@tiptap/react";

/** A highlighted quote from the article itself; `cite` is optional. */
export const Pullquote = Node.create({
  name: "pullquote",
  group: "block",
  content: "inline*",
  marks: "",
  defining: true,

  addAttributes() {
    return { cite: { default: null } };
  },

  parseHTML() {
    return [{ tag: "blockquote[data-pullquote]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "blockquote",
      mergeAttributes(HTMLAttributes, {
        "data-pullquote": "",
        ...(node.attrs.cite ? { "data-cite": node.attrs.cite } : {}),
      }),
      0,
    ];
  },
});
