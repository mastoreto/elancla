import { z } from "zod";
import { bibleBookChapters, bibleBookCode } from "./bibleBooks";
import { BIBLE_VERSE_MAX } from "./sermonConstants";

const chapterNumber = z.number().int().min(1);
const verseNumber = z.number().int().min(1).max(BIBLE_VERSE_MAX);

interface PassageShape {
  book: z.infer<typeof bibleBookCode>;
  chapter: number;
  verseFrom?: number | undefined;
  chapterTo?: number | undefined;
  verseTo?: number | undefined;
}

const chaptersExist = ({ book, chapter, chapterTo }: PassageShape): boolean => {
  const last = bibleBookChapters(book);
  return chapter <= last && (chapterTo === undefined || chapterTo <= last);
};

const chapterRangeGoesForward = ({
  chapter,
  chapterTo,
}: PassageShape): boolean => chapterTo === undefined || chapterTo > chapter;

/**
 * `verseTo` needs `verseFrom`. A range that crosses chapters names both verses or neither; a range
 * inside one chapter must end after it starts.
 */
const versesAreConsistent = ({
  verseFrom,
  chapterTo,
  verseTo,
}: PassageShape): boolean => {
  if (verseTo !== undefined && verseFrom === undefined) return false;
  if (chapterTo !== undefined) {
    return (verseFrom === undefined) === (verseTo === undefined);
  }
  return (
    verseFrom === undefined || verseTo === undefined || verseTo > verseFrom
  );
};

/**
 * A reference as the preacher cites it: `John 3` (chapter), `John 3:16` (verse), `John 3:16-18`
 * (verses), `John 3-4` (chapters) or `John 3:16-4:2` (across chapters). The chapters must exist in
 * the book; verse counts are not checked (there is no per-chapter table).
 */
export const sermonPassage = z
  .strictObject({
    book: bibleBookCode,
    chapter: chapterNumber,
    verseFrom: verseNumber.optional(),
    chapterTo: chapterNumber.optional(),
    verseTo: verseNumber.optional(),
  })
  .refine(chaptersExist, {
    path: ["chapter"],
    message: "The chapter does not exist in this book",
  })
  .refine(chapterRangeGoesForward, {
    path: ["chapterTo"],
    message: "chapterTo must be after chapter",
  })
  .refine(versesAreConsistent, {
    path: ["verseTo"],
    message: "The verse range is not consistent",
  });
export type SermonPassage = z.infer<typeof sermonPassage>;
