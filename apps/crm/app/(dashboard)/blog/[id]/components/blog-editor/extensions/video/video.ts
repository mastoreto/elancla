import { mergeAttributes, Node, ReactNodeViewRenderer } from "@tiptap/react";
import { VideoNodeView } from "./video-node-view";

/** A YouTube video, stored by id; the site renders it as a privacy-enhanced embed. */
export const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      youtubeId: { default: "" },
      title: { default: "" },
      caption: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-video]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-video": node.attrs.youtubeId })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView);
  },
});
