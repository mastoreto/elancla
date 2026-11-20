import type { AnyExtension } from "@tiptap/react";
import { DropCapParagraph } from "./drop-cap-paragraph";
import { Figure } from "./figure";
import { LinkCards } from "./link-cards";
import { Note } from "./note";
import { Pullquote } from "./pullquote";
import { Verse } from "./verse";
import { Video } from "./video";

/** Every node the blog body adds to the base editor, in the order the schema lists them. */
export const blogExtensions: AnyExtension[] = [
  DropCapParagraph,
  Verse,
  Figure,
  Pullquote,
  Video,
  Note,
  LinkCards,
];

export { DropCapParagraph, Figure, LinkCards, Note, Pullquote, Verse, Video };
