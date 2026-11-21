import { describe, expect, test } from "bun:test";
import { youtubeIdFromUrl } from "./youtubeIdFromUrl";

const ID = "dQw4w9WgXcQ";

describe("youtubeIdFromUrl", () => {
  test.each([
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}&t=30s`,
    `https://m.youtube.com/watch?feature=share&v=${ID}`,
    `https://youtu.be/${ID}?si=abc`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube.com/shorts/${ID}`,
    `youtube.com/watch?v=${ID}`,
    `  ${ID}  `,
  ])("extracts the id from %s", (input) => {
    expect(youtubeIdFromUrl(input)).toBe(ID);
  });

  test.each([
    "",
    "not a url",
    "https://vimeo.com/123456789",
    "https://evil.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=short",
    "https://www.youtube.com/watch?v=<script>alert(1)</script>",
    "https://www.youtube.com/channel/UC1234567890",
  ])("rejects %s", (input) => {
    expect(youtubeIdFromUrl(input)).toBeNull();
  });
});
