import { describe, expect, test } from "bun:test";
import {
  type CalendarReminderInput,
  renderCalendarReminderEmail,
} from "./renderCalendarReminderEmail";

const base: CalendarReminderInput = {
  churchName: "Iglesia El Ancla",
  recipientEmail: "tesorero@example.test",
  year: 2027,
  yearPublished: false,
  pendingReviews: 2,
  actionUrl: "https://crm.example.test/calendar",
};

describe("renderCalendarReminderEmail", () => {
  test("lists what is missing and links to the calendar", async () => {
    const email = await renderCalendarReminderEmail(base);
    expect(email.subject).toBe("Falta preparar el calendario 2027");
    expect(email.text).toContain("Publicar el calendario 2027");
    expect(email.text).toContain("Confirmar 2");
    expect(email.html).toContain("https://crm.example.test/calendar");
  });

  test("a published year only asks for the reviews", async () => {
    const email = await renderCalendarReminderEmail({
      ...base,
      yearPublished: true,
      pendingReviews: 1,
    });
    expect(email.text).not.toContain("Publicar el calendario");
    expect(email.text).toContain("Confirmar 1");
  });
});
