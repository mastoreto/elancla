import { describe, expect, test } from "bun:test";
import type { MinistryListItemDto } from "@ancla/contracts";
import {
  toMinistrySettingsBody,
  toMinistrySettingsValues,
  validateMinistrySettings,
} from "./ministrySettingsValues";

const ministry: MinistryListItemDto = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Alabanza",
  title: null,
  version: 3,
  categoryId: null,
  destination: "page",
  externalUrl: null,
  icon: null,
  color: "secondary-700",
  showOnLanding: false,
  landingOrder: 0,
  landingTile: "color",
  landingTone: "mist",
  landingPhotoId: null,
  live: null,
  working: null,
};

describe("ministry settings values", () => {
  test("blank selects are sent as null and the version is carried", () => {
    const body = toMinistrySettingsBody(toMinistrySettingsValues(ministry), ministry.version);
    expect(body).toEqual({
      version: 3,
      categoryId: null,
      destination: "page",
      externalUrl: null,
      icon: null,
      color: "secondary-700",
    });
  });

  test("the URL only travels with an external destination", () => {
    const values = { ...toMinistrySettingsValues(ministry), externalUrl: "https://example.org" };
    expect(toMinistrySettingsBody(values, 1).externalUrl).toBeNull();
    expect(toMinistrySettingsBody({ ...values, destination: "external" }, 1).externalUrl).toBe(
      "https://example.org",
    );
  });

  test("an external destination needs an https URL", () => {
    const values = { ...toMinistrySettingsValues(ministry), destination: "external" as const };
    expect(validateMinistrySettings(values).externalUrl).toBeDefined();
    expect(
      validateMinistrySettings({ ...values, externalUrl: "http://a.org" }).externalUrl,
    ).toBeDefined();
    expect(validateMinistrySettings({ ...values, externalUrl: "https://a.org" })).toEqual({});
  });
});
