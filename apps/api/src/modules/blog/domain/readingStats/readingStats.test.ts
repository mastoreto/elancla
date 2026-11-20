import { describe, expect, test } from "bun:test";
import { readingStats } from "./readingStats";

const paragraph = (text: string) => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});
const words = (count: number) => Array(count).fill("palabra").join(" ");

describe("readingStats", () => {
  test("an empty document is one minute and no words", () => {
    expect(readingStats({ type: "doc", content: [] })).toEqual({
      wordCount: 0,
      readingMinutes: 1,
    });
  });

  test("blocks without whitespace between them do not glue their words", () => {
    const doc = {
      type: "doc",
      content: [paragraph("uno dos"), paragraph("tres")],
    };
    expect(readingStats(doc).wordCount).toBe(3);
  });

  test("rounds the minutes up at 200 words per minute", () => {
    const at = (count: number) =>
      readingStats({ type: "doc", content: [paragraph(words(count))] });
    expect(at(200).readingMinutes).toBe(1);
    expect(at(201).readingMinutes).toBe(2);
    expect(at(1000).readingMinutes).toBe(5);
  });

  test("counts the text of inline marks as one flow", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "uno " },
            { type: "text", text: "dos", marks: [{ type: "bold" }] },
          ],
        },
      ],
    };
    expect(readingStats(doc).wordCount).toBe(2);
  });
});
