import { describe, expect, test } from "bun:test";
import {
  type EditorialNoticeInput,
  renderEditorialNoticeEmail,
} from "./renderEditorialNoticeEmail";

const base: EditorialNoticeInput = {
  variant: "submitted",
  churchName: "Iglesia El Ancla",
  recipientEmail: "revisor@example.test",
  contentLabel: "una entrada del blog",
  actorName: "Ana",
  actionUrl: "https://crm.example.test/blog",
};

describe("renderEditorialNoticeEmail", () => {
  test("submitted tells the reviewer who sent what and links to the CRM", async () => {
    const email = await renderEditorialNoticeEmail(base);
    expect(email.subject).toBe("Ana envió una entrada del blog a revisión");
    expect(email.html).toContain("https://crm.example.test/blog");
    expect(email.text).toContain("Ana envió una entrada del blog");
  });

  test("approved tells the author it is published", async () => {
    const email = await renderEditorialNoticeEmail({
      ...base,
      variant: "approved",
    });
    expect(email.subject).toContain("ya está publicado");
    expect(email.text).toContain("ya está publicado");
  });

  test("changes requested carries the comment", async () => {
    const email = await renderEditorialNoticeEmail({
      ...base,
      variant: "changesRequested",
      comment: "Falta el título",
    });
    expect(email.subject).toStartWith("Te pidieron cambios");
    expect(email.html).toContain("Falta el título");
    expect(email.text).toContain("Falta el título");
  });

  test("without a comment there is no comment panel", async () => {
    const email = await renderEditorialNoticeEmail(base);
    expect(email.text).not.toContain("Comentario");
  });
});
