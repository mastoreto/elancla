import type { BLOG_FIGURE_ASPECTS } from "@ancla/contracts";

export type FigureAspect = (typeof BLOG_FIGURE_ASPECTS)[number];

/** Attributes of the `figure` node, as the schema stores them. */
export interface FigureAttrs {
  mediaId: string;
  alt: string;
  caption: string | null;
  aspect: FigureAspect;
}

/** Attributes of the `video` node. */
export interface VideoAttrs {
  youtubeId: string;
  title: string;
  caption: string | null;
}

/** One card of the `linkCards` node. */
export interface LinkCardItem {
  title: string;
  description?: string | null;
  href: string;
  sourceLabel?: string | null;
}

/** What a dialog hands back when the user confirms. */
export type DialogSubmit<TValue> = (value: TValue) => void;
