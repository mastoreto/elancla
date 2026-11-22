import { z } from "zod";
import {
  calendarDate,
  EVENT_DESCRIPTION_MAX_LENGTH,
  EVENT_EXTERNAL_ADDRESS_MAX_LENGTH,
  EVENT_LINK_URL_MAX_LENGTH,
  EVENT_MINISTRIES_MAX_COUNT,
  EVENT_PLACE_MODES,
  EVENT_STATUSES,
  EVENT_TITLE_MAX_LENGTH,
  type EventPlaceMode,
  timeOfDay,
} from "./calendarConstants";

const LOCALE_PATTERN = /^[a-z]{2}(-[A-Z]{2})?$/;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? undefined : value))
    .optional();

/** One language of an event. Strict: an unknown key is a client bug, not data. */
export const eventTranslation = z.strictObject({
  title: z.string().trim().min(1).max(EVENT_TITLE_MAX_LENGTH),
  description: optionalText(EVENT_DESCRIPTION_MAX_LENGTH),
});
export type EventTranslation = z.infer<typeof eventTranslation>;

interface EventWhen {
  startDate: string;
  startTime?: string | undefined;
  endDate?: string | undefined;
  endTime?: string | undefined;
  allDay: boolean;
}

interface EventWhere {
  placeMode: EventPlaceMode;
  placeId?: string | undefined;
  externalAddress?: string | undefined;
}

const allDayHasNoTimes = ({ allDay, startTime, endTime }: EventWhen): boolean =>
  !allDay || (startTime === undefined && endTime === undefined);

const endTimeNeedsStartTime = ({ startTime, endTime }: EventWhen): boolean =>
  endTime === undefined || startTime !== undefined;

const endIsNotBeforeStart = ({
  startDate,
  startTime,
  endDate,
  endTime,
}: EventWhen): boolean => {
  const lastDate = endDate ?? startDate;
  if (lastDate !== startDate) return lastDate > startDate;
  return (
    startTime === undefined || endTime === undefined || endTime > startTime
  );
};

const placeMatchesMode = ({
  placeMode,
  placeId,
  externalAddress,
}: EventWhere): boolean => {
  if (placeMode === "place") {
    return placeId !== undefined && externalAddress === undefined;
  }
  if (placeMode === "external") {
    return externalAddress !== undefined && placeId === undefined;
  }
  return placeId === undefined && externalAddress === undefined;
};

/**
 * What a revision of an event holds. That the default language is present, that no unknown locale
 * slips in, that the date falls in the event's year and that the place, ministries and image belong
 * to the organization is checked by the API (a schema cannot know it).
 */
export const eventSnapshot = z
  .strictObject({
    translations: z
      .record(z.string().regex(LOCALE_PATTERN), eventTranslation)
      .refine((translations) => Object.keys(translations).length > 0, {
        message: "At least one language is required",
      }),
    startDate: calendarDate,
    startTime: timeOfDay.optional(),
    /** Absent for a one-day event. */
    endDate: calendarDate.optional(),
    endTime: timeOfDay.optional(),
    allDay: z.boolean().default(false),
    placeMode: z.enum(EVENT_PLACE_MODES),
    placeId: z.uuid().optional(),
    externalAddress: z
      .string()
      .trim()
      .min(1)
      .max(EVENT_EXTERNAL_ADDRESS_MAX_LENGTH)
      .optional(),
    /** Empty means "the church in general". */
    ministryIds: z
      .array(z.uuid())
      .max(EVENT_MINISTRIES_MAX_COUNT)
      .refine((ids) => new Set(ids).size === ids.length, {
        message: "A ministry can only be listed once",
      })
      .default([]),
    imageId: z.uuid().optional(),
    linkUrl: z
      .string()
      .max(EVENT_LINK_URL_MAX_LENGTH)
      .regex(/^https:\/\/\S+$/, { message: "Must be an https URL" })
      .optional(),
    status: z.enum(EVENT_STATUSES).default("scheduled"),
  })
  .refine(allDayHasNoTimes, {
    path: ["allDay"],
    message: "An all-day event has no start or end time",
  })
  .refine(endTimeNeedsStartTime, {
    path: ["endTime"],
    message: "endTime needs a startTime",
  })
  .refine(endIsNotBeforeStart, {
    path: ["endDate"],
    message: "The event must not end before it starts",
  })
  .refine(placeMatchesMode, {
    path: ["placeMode"],
    message:
      "place needs placeId, external needs externalAddress and tbc needs neither",
  });
export type EventSnapshot = z.infer<typeof eventSnapshot>;
