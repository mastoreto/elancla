import { describe, expect, test } from "bun:test";
import { MAX_MEDIA_FILE_NAME_LENGTH } from "@ancla/contracts";
import { sanitizeFileName } from "./sanitizeFileName";

describe("sanitizeFileName", () => {
  test("keeps an ordinary name, accents included", () => {
    expect(sanitizeFileName("Comprobante agosto ñandú.pdf")).toBe(
      "Comprobante agosto ñandú.pdf",
    );
  });

  test("drops any path", () => {
    expect(sanitizeFileName("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFileName("C:\\Users\\a\\factura.pdf")).toBe("factura.pdf");
  });

  test("removes control and special characters", () => {
    expect(sanitizeFileName('a<b>c:"d"|e?f*\u0000g.png')).toBe("abcdefg.png");
    expect(sanitizeFileName("line\nbreak.png")).toBe("linebreak.png");
  });

  test("never ends in nothing, a dot or a space", () => {
    expect(sanitizeFileName("   ")).toBe("file");
    expect(sanitizeFileName("..")).toBe("file");
    expect(sanitizeFileName("name. ")).toBe("name");
  });

  test("cuts long names but keeps the extension", () => {
    const sanitized = sanitizeFileName(`${"a".repeat(500)}.pdf`);
    expect(sanitized).toHaveLength(MAX_MEDIA_FILE_NAME_LENGTH);
    expect(sanitized.endsWith(".pdf")).toBe(true);
  });
});
