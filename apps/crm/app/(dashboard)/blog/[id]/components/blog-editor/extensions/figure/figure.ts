import { BLOG_FIGURE_ASPECTS } from "@ancla/contracts";
import { mergeAttributes, Node, ReactNodeViewRenderer } from "@tiptap/react";
import { FigureNodeView } from "./figure-node-view";

export const DEFAULT_FIGURE_ASPECT = BLOG_FIGURE_ASPECTS[0];

/** An image of the media library with alt text, optional caption and a display ratio. */
export const Figure = Node.create({
  name: "figure",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      mediaId: { default: null },
      alt: { default: "" },
      caption: { default: null },
      aspect: { default: DEFAULT_FIGURE_ASPECT },
    };
  },

  parseHTML() {
    return [{ tag: "figure[data-figure]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ["figure", mergeAttributes(HTMLAttributes, { "data-figure": node.attrs.mediaId })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FigureNodeView);
  },
});
