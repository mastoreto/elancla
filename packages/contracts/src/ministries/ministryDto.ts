import { z } from "zod";
import { revisionSummaryDto } from "../editorial";
import {
  LANDING_TILES,
  LANDING_TONES,
  MINISTRY_COLORS,
  MINISTRY_DESTINATIONS,
  MINISTRY_EXTERNAL_URL_MAX_LENGTH,
  MINISTRY_ICONS,
  MINISTRY_LEADERS_MAX_COUNT,
  MINISTRY_NAME_MAX_LENGTH,
  MINISTRY_ORDER_MAX,
} from "./ministryConstants";

/** Minimal ministry (phase 0.4): what users, invitations and treasury refer to. */
export const ministryDto = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
});

export type MinistryDto = z.infer<typeof ministryDto>;

export const ministryIcon = z.enum(MINISTRY_ICONS);
export const ministryColor = z.enum(MINISTRY_COLORS);
export const landingTone = z.enum(LANDING_TONES);
export const ministryDestination = z.enum(MINISTRY_DESTINATIONS);
export const landingTile = z.enum(LANDING_TILES);

const ministryExternalUrl = z
  .string()
  .max(MINISTRY_EXTERNAL_URL_MAX_LENGTH)
  .regex(/^https:\/\/\S+$/, { message: "Must be an https URL" });

/** A ministry as the CRM lists and edits it: settings plus the editorial state of the profile. */
export const ministryListItemDto = z.strictObject({
  id: z.uuid(),
  /** Internal name, used by users, invitations and treasury. */
  name: z.string(),
  /** Public name in the default language of the working (or else live) revision; null before any draft. */
  title: z.string().nullable(),
  version: z.number().int(),
  categoryId: z.uuid().nullable(),
  destination: ministryDestination,
  externalUrl: z.string().nullable(),
  icon: ministryIcon.nullable(),
  color: ministryColor,
  showOnLanding: z.boolean(),
  landingOrder: z.number().int(),
  landingTile,
  landingTone,
  landingPhotoId: z.uuid().nullable(),
  live: revisionSummaryDto.nullable(),
  working: revisionSummaryDto.nullable(),
});
export type MinistryListItemDto = z.infer<typeof ministryListItemDto>;

export const ministryListDto = z.strictObject({
  items: z.array(ministryListItemDto),
});
export type MinistryListDto = z.infer<typeof ministryListDto>;

export const createMinistryBody = z.strictObject({
  name: z.string().trim().min(1).max(MINISTRY_NAME_MAX_LENGTH),
});
export type CreateMinistryBody = z.infer<typeof createMinistryBody>;

export const createMinistryResponse = z.strictObject({ id: z.uuid() });
export type CreateMinistryResponse = z.infer<typeof createMinistryResponse>;

/**
 * Settings body (PATCH `/content/ministries/:id/settings`). Strict: a financial field such as
 * `budget` is a 400 here, treasury has its own permission and routes. `version` is the one read,
 * for the optimistic lock (409 `stale_version`).
 */
export const ministrySettingsBody = z
  .strictObject({
    version: z.number().int().min(1),
    categoryId: z.uuid().nullable(),
    destination: ministryDestination,
    externalUrl: ministryExternalUrl.nullable().default(null),
    icon: ministryIcon.nullable(),
    color: ministryColor,
  })
  .refine((body) => body.destination !== "external" || body.externalUrl, {
    message: "externalUrl is required when the destination is external",
    path: ["externalUrl"],
  });
export type MinistrySettingsBody = z.infer<typeof ministrySettingsBody>;

const leaderTitleDto = z.strictObject({
  title: z.string().trim().min(1).max(80),
});

export const ministryLeaderDto = z.strictObject({
  personProfileId: z.uuid(),
  name: z.string(),
  visible: z.boolean(),
  order: z.number().int(),
  translations: z.record(z.string(), leaderTitleDto),
});
export type MinistryLeaderDto = z.infer<typeof ministryLeaderDto>;

export const ministryLeadersDto = z.strictObject({
  items: z.array(ministryLeaderDto),
});
export type MinistryLeadersDto = z.infer<typeof ministryLeadersDto>;

/** PUT `/content/ministries/:id/leaders`: replaces the whole list of that ministry. */
export const ministryLeadersBody = z
  .array(
    z.strictObject({
      personProfileId: z.uuid(),
      /** Hidden unless turned on: a leader only shows on the public site on purpose. */
      visible: z.boolean().default(false),
      order: z.number().int().min(0).max(MINISTRY_ORDER_MAX),
      translations: z
        .record(z.string(), leaderTitleDto)
        .refine((translations) => Object.keys(translations).length > 0, {
          message: "At least one language is required",
        }),
    }),
  )
  .max(MINISTRY_LEADERS_MAX_COUNT)
  .refine(
    (leaders) =>
      new Set(leaders.map((leader) => leader.personProfileId)).size ===
      leaders.length,
    { message: "A person can only appear once" },
  );
export type MinistryLeadersBody = z.infer<typeof ministryLeadersBody>;

/** PATCH `/content/ministries/landing`: the whole mosaic in one transaction. */
export const ministryLandingBody = z
  .array(
    z
      .strictObject({
        id: z.uuid(),
        showOnLanding: z.boolean(),
        landingOrder: z.number().int().min(0).max(MINISTRY_ORDER_MAX),
        landingTile,
        landingTone,
        landingPhotoId: z.uuid().nullable().default(null),
      })
      .refine((tile) => tile.landingTile !== "photo" || tile.landingPhotoId, {
        message: "A photo tile needs landingPhotoId",
        path: ["landingPhotoId"],
      }),
  )
  .refine(
    (tiles) => new Set(tiles.map((tile) => tile.id)).size === tiles.length,
    {
      message: "A ministry can only appear once",
    },
  );
export type MinistryLandingBody = z.infer<typeof ministryLandingBody>;
