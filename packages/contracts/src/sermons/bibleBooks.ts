import { z } from "zod";

/**
 * The 66 books of the Protestant canon in canonical order, by OSIS code, with the number of
 * chapters of each. The names of the books are not here: they are i18n (web es/en/pt, CRM es).
 */
export const BIBLE_BOOKS = [
  { code: "Gen", chapters: 50 },
  { code: "Exod", chapters: 40 },
  { code: "Lev", chapters: 27 },
  { code: "Num", chapters: 36 },
  { code: "Deut", chapters: 34 },
  { code: "Josh", chapters: 24 },
  { code: "Judg", chapters: 21 },
  { code: "Ruth", chapters: 4 },
  { code: "1Sam", chapters: 31 },
  { code: "2Sam", chapters: 24 },
  { code: "1Kgs", chapters: 22 },
  { code: "2Kgs", chapters: 25 },
  { code: "1Chr", chapters: 29 },
  { code: "2Chr", chapters: 36 },
  { code: "Ezra", chapters: 10 },
  { code: "Neh", chapters: 13 },
  { code: "Esth", chapters: 10 },
  { code: "Job", chapters: 42 },
  { code: "Ps", chapters: 150 },
  { code: "Prov", chapters: 31 },
  { code: "Eccl", chapters: 12 },
  { code: "Song", chapters: 8 },
  { code: "Isa", chapters: 66 },
  { code: "Jer", chapters: 52 },
  { code: "Lam", chapters: 5 },
  { code: "Ezek", chapters: 48 },
  { code: "Dan", chapters: 12 },
  { code: "Hos", chapters: 14 },
  { code: "Joel", chapters: 3 },
  { code: "Amos", chapters: 9 },
  { code: "Obad", chapters: 1 },
  { code: "Jonah", chapters: 4 },
  { code: "Mic", chapters: 7 },
  { code: "Nah", chapters: 3 },
  { code: "Hab", chapters: 3 },
  { code: "Zeph", chapters: 3 },
  { code: "Hag", chapters: 2 },
  { code: "Zech", chapters: 14 },
  { code: "Mal", chapters: 4 },
  { code: "Matt", chapters: 28 },
  { code: "Mark", chapters: 16 },
  { code: "Luke", chapters: 24 },
  { code: "John", chapters: 21 },
  { code: "Acts", chapters: 28 },
  { code: "Rom", chapters: 16 },
  { code: "1Cor", chapters: 16 },
  { code: "2Cor", chapters: 13 },
  { code: "Gal", chapters: 6 },
  { code: "Eph", chapters: 6 },
  { code: "Phil", chapters: 4 },
  { code: "Col", chapters: 4 },
  { code: "1Thess", chapters: 5 },
  { code: "2Thess", chapters: 3 },
  { code: "1Tim", chapters: 6 },
  { code: "2Tim", chapters: 4 },
  { code: "Titus", chapters: 3 },
  { code: "Phlm", chapters: 1 },
  { code: "Heb", chapters: 13 },
  { code: "Jas", chapters: 5 },
  { code: "1Pet", chapters: 5 },
  { code: "2Pet", chapters: 3 },
  { code: "1John", chapters: 5 },
  { code: "2John", chapters: 1 },
  { code: "3John", chapters: 1 },
  { code: "Jude", chapters: 1 },
  { code: "Rev", chapters: 22 },
] as const;

export type BibleBookCode = (typeof BIBLE_BOOKS)[number]["code"];

export const BIBLE_BOOK_CODES = BIBLE_BOOKS.map((book) => book.code) as [
  BibleBookCode,
  ...BibleBookCode[],
];

export const bibleBookCode = z.enum(BIBLE_BOOK_CODES);

/** Number of chapters of a book. */
export function bibleBookChapters(code: BibleBookCode): number {
  const book = BIBLE_BOOKS.find((candidate) => candidate.code === code);
  if (!book) throw new Error(`Unknown Bible book ${code}`);
  return book.chapters;
}
