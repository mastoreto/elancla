export type SermonStatus = "published" | "draft";

export type SermonStatusFilter = SermonStatus | "all";

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  passage: string;
  series: string;
  status: SermonStatus;
  /** ISO date of the service; undefined while the sermon is a draft. */
  date: string | undefined;
  plays: number | undefined;
  youtubeUrl: string;
}

export interface SermonFormValues {
  title: string;
  preacher: string;
  passage: string;
  summary: string;
  series: string;
  date: string;
  youtubeUrl: string;
}
