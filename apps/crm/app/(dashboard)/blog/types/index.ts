export type BlogStatus = "draft" | "published" | "paused";

/** Operational state of the public-facing blog as a whole. */
export type BlogConfigStatus = "live" | "maintenance" | "offline";

export interface BlogConfig {
  status: BlogConfigStatus;
}

export interface BlogCategory {
  id: string;
  label: string;
}

export interface BlogAuthor {
  id: string;
  name: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description?: string;
  heroImage?: string;
  tags?: string[];
  views: number;
  categories: BlogCategory[];
  /** ISO date string — date the post was written (always present). */
  writtenAt: string;
  /** ISO date string — date it went live. Undefined while in draft. */
  publishedAt: string | undefined;
  author: BlogAuthor;
  status: BlogStatus;
}
