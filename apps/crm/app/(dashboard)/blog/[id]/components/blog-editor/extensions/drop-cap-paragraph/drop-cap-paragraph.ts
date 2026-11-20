import { mergeAttributes, Node } from "@tiptap/react";

/**
 * The base paragraph plus the blog's `dropCap` attribute. It is named `paragraph` so it replaces
 * the StarterKit one (`RichTextEditor` drops that one when an extension has this name).
 */
export const DropCapParagraph = Node.create({
  name: "paragraph",
  priority: 1000,
  group: "block",
  content: "inline*",

  addAttributes() {
    return {
      dropCap: {
        default: null,
        parseHTML: (element) => (element.hasAttribute("data-drop-cap") ? true : null),
        renderHTML: (attributes) => (attributes.dropCap ? { "data-drop-cap": "true" } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "p" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["p", mergeAttributes(HTMLAttributes), 0];
  },
});
