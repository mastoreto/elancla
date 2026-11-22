import { describe, expect, test } from "bun:test";
import { REMINDER_RECIPIENTS_MAX_COUNT } from "@ancla/contracts";
import {
  reminderFormChanged,
  toReminderBody,
  toReminderFormValues,
  validateReminderForm,
} from "./reminderFormValues";

const settings = { recipientRoleIds: ["r1", "r2"], recipientUserIds: ["u1"] };

describe("toReminderFormValues", () => {
  test("keeps the saved recipients when nothing can be compared", () => {
    expect(toReminderFormValues(settings, { roleIds: null, userIds: null })).toEqual({
      recipientRoleIds: ["r1", "r2"],
      recipientUserIds: ["u1"],
    });
  });

  test("drops roles and users that are no longer on offer", () => {
    expect(toReminderFormValues(settings, { roleIds: ["r2"], userIds: [] })).toEqual({
      recipientRoleIds: ["r2"],
      recipientUserIds: [],
    });
  });

  test("a kind the user cannot list keeps its ids while the other is filtered", () => {
    expect(toReminderFormValues(settings, { roleIds: ["r1"], userIds: null })).toEqual({
      recipientRoleIds: ["r1"],
      recipientUserIds: ["u1"],
    });
  });
});

describe("toReminderBody", () => {
  test("sends each id once", () => {
    expect(
      toReminderBody({ recipientRoleIds: ["r1", "r1"], recipientUserIds: ["u1", "u2"] }),
    ).toEqual({
      recipientRoleIds: ["r1"],
      recipientUserIds: ["u1", "u2"],
    });
  });

  test("no recipients is a valid body (the admins are notified)", () => {
    expect(toReminderBody({ recipientRoleIds: [], recipientUserIds: [] })).toEqual({
      recipientRoleIds: [],
      recipientUserIds: [],
    });
  });
});

describe("validateReminderForm", () => {
  test("accepts the limit and rejects one more", () => {
    const ids = Array.from({ length: REMINDER_RECIPIENTS_MAX_COUNT }, (_, index) => `id-${index}`);
    expect(validateReminderForm({ recipientRoleIds: ids, recipientUserIds: [] })).toEqual({
      recipientRoleIds: undefined,
      recipientUserIds: undefined,
    });
    const errors = validateReminderForm({ recipientRoleIds: [], recipientUserIds: [...ids, "x"] });
    expect(errors.recipientUserIds).toContain(String(REMINDER_RECIPIENTS_MAX_COUNT));
    expect(errors.recipientRoleIds).toBeUndefined();
  });
});

describe("reminderFormChanged", () => {
  test("ignores the order but notices a different recipient", () => {
    const saved = { recipientRoleIds: ["r1", "r2"], recipientUserIds: [] };
    expect(
      reminderFormChanged(saved, { recipientRoleIds: ["r2", "r1"], recipientUserIds: [] }),
    ).toBe(false);
    expect(reminderFormChanged(saved, { recipientRoleIds: ["r1"], recipientUserIds: [] })).toBe(
      true,
    );
    expect(
      reminderFormChanged(saved, { recipientRoleIds: ["r1", "r3"], recipientUserIds: [] }),
    ).toBe(true);
  });
});
