import { z } from "zod";
import { MEDIA_PURPOSE_KEYS, mediaPurposeOf } from "./mediaPurposes";

export const MAX_MEDIA_FILE_NAME_LENGTH = 200;
export const MEDIA_FILE_STATUSES = ["pending", "ready"] as const;
export const MEDIA_VARIANT_FORMATS = ["webp", "avif"] as const;

const purposeSchema = z.enum(MEDIA_PURPOSE_KEYS);

/** Declares the file before any byte moves; the storage and `finalize` enforce it afterwards. */
export const createUploadBody = z
  .strictObject({
    purpose: purposeSchema,
    contentType: z.string().trim().toLowerCase().min(1).max(100),
    size: z.number().int().positive(),
    fileName: z.string().trim().min(1).max(255),
  })
  .superRefine((body, context) => {
    const purpose = mediaPurposeOf(body.purpose);
    if (!purpose.contentTypes.includes(body.contentType)) {
      context.addIssue({
        code: "custom",
        path: ["contentType"],
        message: `Not allowed for ${body.purpose}`,
      });
    }
    if (body.size > purpose.maxBytes) {
      context.addIssue({
        code: "custom",
        path: ["size"],
        message: `At most ${purpose.maxBytes} bytes for ${body.purpose}`,
      });
    }
  });

/** Where and how the browser must PUT the bytes. */
export const uploadTicketDto = z.object({
  id: z.uuid(),
  uploadUrl: z.url(),
  /** Headers the browser must send as they are: the signature covers them. */
  headers: z.record(z.string(), z.string()),
  expiresAt: z.iso.datetime(),
});

export const mediaVariantDto = z.object({
  width: z.number().int().positive(),
  format: z.enum(MEDIA_VARIANT_FORMATS),
  url: z.url(),
});

export const mediaFileDto = z.object({
  id: z.uuid(),
  purpose: purposeSchema,
  status: z.enum(MEDIA_FILE_STATUSES),
  contentType: z.string(),
  size: z.number().int().nonnegative(),
  originalName: z.string(),
  /** Public images only; empty for private files and while pending. */
  variants: z.array(mediaVariantDto),
  createdAt: z.iso.datetime(),
});

export const downloadLinkDto = z.object({
  url: z.url(),
  expiresAt: z.iso.datetime(),
});

export type CreateUploadBody = z.infer<typeof createUploadBody>;
export type UploadTicketDto = z.infer<typeof uploadTicketDto>;
export type MediaVariantDto = z.infer<typeof mediaVariantDto>;
export type MediaFileDto = z.infer<typeof mediaFileDto>;
export type DownloadLinkDto = z.infer<typeof downloadLinkDto>;
