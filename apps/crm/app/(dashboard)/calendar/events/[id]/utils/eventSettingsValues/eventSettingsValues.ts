import type { EventSettingsBody } from "@ancla/contracts";
import type { EventRow, EventSettingsValues } from "../../types";

export function toEventSettingsValues(
  event: Pick<EventRow, "visibility" | "audienceRoleIds">,
): EventSettingsValues {
  return { visibility: event.visibility, audienceRoleIds: [...event.audienceRoleIds] };
}

/** The audience only means something for an internal event, so a public one sends none. */
export function toEventSettingsBody(
  values: EventSettingsValues,
  version: number,
): EventSettingsBody {
  return {
    visibility: values.visibility,
    audienceRoleIds: values.visibility === "internal" ? values.audienceRoleIds : [],
    version,
  };
}
