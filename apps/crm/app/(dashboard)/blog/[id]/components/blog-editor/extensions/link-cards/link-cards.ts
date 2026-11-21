import { mergeAttributes, Node, ReactNodeViewRenderer } from "@tiptap/react";
import { LinkCardsNodeView } from "./link-cards-node-view";

/** Up to six cards that point to outside resources. */
export const LinkCards = Node.create({
  name: "linkCards",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return { items: { default: [] } };
  },

  parseHTML() {
    return [{ tag: "div[data-link-cards]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-link-cards": "" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkCardsNodeView);
  },
});
