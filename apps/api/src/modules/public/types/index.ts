import type {
  MinistrySnapshot,
  MinistryTranslation,
  PublicBlogImageDto,
} from "@ancla/contracts";
import type { BlogEntry, PickedBlogTranslation } from "../../blog";
import type { SeriesRow } from "../../sermons";
import type {
  PublicBlogAuthorRow,
  PublicBlogCategoryRow,
  PublicBlogSeriesRow,
  PublicMinistryRow,
} from "../data";
import type {
  PickedSermonTranslation,
  SermonEntry,
  ServedLocales,
} from "../domain";

/** A published post together with the language it is served in. */
export interface ServedBlogEntry extends BlogEntry, PickedBlogTranslation {}

/** What the blog mappers read besides the post itself; everything is already loaded. */
export interface PublicBlogContext extends ServedLocales {
  timeZone: string;
  /** Edition number of each visible post, by post id. */
  issues: ReadonlyMap<string, number>;
  categories: ReadonlyMap<string, PublicBlogCategoryRow>;
  series: ReadonlyMap<string, PublicBlogSeriesRow>;
  authors: ReadonlyMap<string, PublicBlogAuthorRow>;
  /** Ready images by media id (covers and figures); a media id that is absent is not shown. */
  images: ReadonlyMap<string, PublicBlogImageDto>;
  publicBaseUrl: string;
}

/** A published sermon together with the language it is served in. */
export interface ServedSermonEntry
  extends SermonEntry,
    PickedSermonTranslation {}

/** What the sermon mappers read besides the sermon itself; everything is already loaded. */
export interface PublicSermonContext extends ServedLocales {
  /** Series that are not deleted, by id. */
  series: ReadonlyMap<string, SeriesRow>;
  /** Name of each preacher, by profile id. */
  preachers: ReadonlyMap<string, string>;
  /** Webp variants of the covers of the sermons that are ready, by media id. */
  covers: ReadonlyMap<string, PublicBlogImageDto[]>;
  publicBaseUrl: string;
}

/** A ministry whose profile is published, with the language it is served in. */
export interface ServedMinistry {
  row: PublicMinistryRow;
  snapshot: MinistrySnapshot;
  locale: string;
  translation: MinistryTranslation;
}
