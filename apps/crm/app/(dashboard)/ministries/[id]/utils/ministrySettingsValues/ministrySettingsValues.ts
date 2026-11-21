import {
  type MinistryListItemDto,
  type MinistrySettingsBody,
  ministrySettingsBody,
} from "@ancla/contracts";
import type { MinistrySettingsErrors, MinistrySettingsValues } from "../../types";

const EXTERNAL_URL_MESSAGE = "Escribe una dirección que empiece con https://.";

export function toMinistrySettingsValues(ministry: MinistryListItemDto): MinistrySettingsValues {
  return {
    categoryId: ministry.categoryId ?? "",
    destination: ministry.destination,
    externalUrl: ministry.externalUrl ?? "",
    icon: ministry.icon ?? "",
    color: ministry.color,
  };
}

/** The body to send: blanks become `null`, and the URL only travels with an external destination. */
export function toMinistrySettingsBody(
  values: MinistrySettingsValues,
  version: number,
): Omit<MinistrySettingsBody, "externalUrl"> & { externalUrl: string | null } {
  return {
    version,
    categoryId: values.categoryId === "" ? null : values.categoryId,
    destination: values.destination,
    externalUrl: values.destination === "external" ? values.externalUrl.trim() : null,
    icon: values.icon === "" ? null : values.icon,
    color: values.color,
  };
}

/** Field errors for what would be sent; empty when the body is valid. */
export function validateMinistrySettings(values: MinistrySettingsValues): MinistrySettingsErrors {
  const result = ministrySettingsBody.safeParse(toMinistrySettingsBody(values, 1));
  if (result.success) return {};
  const urlIssue = result.error.issues.some((issue) => issue.path[0] === "externalUrl");
  return urlIssue ? { externalUrl: EXTERNAL_URL_MESSAGE } : {};
}
