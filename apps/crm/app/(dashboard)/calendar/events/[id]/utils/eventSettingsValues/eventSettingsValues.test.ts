import { describe, expect, test } from "bun:test";
import { eventSettingsBody } from "@ancla/contracts";
import { toEventSettingsBody, toEventSettingsValues } from "./eventSettingsValues";

const ROLE_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_ROLE_ID = "22222222-2222-4222-8222-222222222222";

describe("toEventSettingsValues", () => {
  test("copies the row so editing never touches it", () => {
    const row = { visibility: "internal", audienceRoleIds: [ROLE_ID] } as const;
    const values = toEventSettingsValues(row);
    values.audienceRoleIds.push(OTHER_ROLE_ID);
    expect(row.audienceRoleIds).toEqual([ROLE_ID]);
    expect(values.visibility).toBe("internal");
  });
});

describe("toEventSettingsBody", () => {
  test("an internal event sends its audience and the version read", () => {
    const body = toEventSettingsBody({ visibility: "internal", audienceRoleIds: [ROLE_ID] }, 3);
    expect(body).toEqual({ visibility: "internal", audienceRoleIds: [ROLE_ID], version: 3 });
    expect(eventSettingsBody.safeParse(body).success).toBe(true);
  });

  test("a public event sends no audience, even if roles were ticked before", () => {
    const body = toEventSettingsBody({ visibility: "public", audienceRoleIds: [ROLE_ID] }, 1);
    expect(body.audienceRoleIds).toEqual([]);
    expect(eventSettingsBody.safeParse(body).success).toBe(true);
  });
});
