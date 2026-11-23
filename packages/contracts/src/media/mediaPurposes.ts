import { PERMISSIONS, type Permission } from "../authz";

const BYTES_PER_MEGABYTE = 1024 * 1024;

export const MEDIA_VISIBILITIES = ["public", "private"] as const;
export type MediaVisibility = (typeof MEDIA_VISIBILITIES)[number];

/** Image formats the public pipeline accepts (and `sharp` can read). */
const IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

interface MediaPurposeDefinition {
  /** Bucket of the variants. Every original is quarantined in the private bucket first. */
  visibility: MediaVisibility;
  contentTypes: readonly string[];
  maxBytes: number;
  /** Who may upload for this purpose. */
  uploadPermission: Permission;
  /** Private purposes only: who may download. */
  downloadPermission?: Permission;
}

/**
 * Decides everything about an upload: bucket, allowed types, size limit and permissions. A module
 * that needs files adds its purpose here (there is no separate `media` permission on purpose: the
 * permission of the purpose is the one that governs).
 */
export const MEDIA_PURPOSES = {
  contentImage: {
    visibility: "public",
    contentTypes: IMAGE_CONTENT_TYPES,
    maxBytes: 15 * BYTES_PER_MEGABYTE,
    uploadPermission: PERMISSIONS.content.create,
  },
  // Public PDFs attached to content (sermon outlines). Served as they are: no variants.
  contentDocument: {
    visibility: "public",
    contentTypes: ["application/pdf"],
    maxBytes: 20 * BYTES_PER_MEGABYTE,
    uploadPermission: PERMISSIONS.sermons.edit,
  },
  voucherDocument: {
    visibility: "private",
    contentTypes: [
      "application/pdf",
      ...IMAGE_CONTENT_TYPES.filter((type) => type !== "image/avif"),
    ],
    maxBytes: 20 * BYTES_PER_MEGABYTE,
    uploadPermission: PERMISSIONS.vouchers.create,
    downloadPermission: PERMISSIONS.vouchers.view,
  },
} as const satisfies Record<string, MediaPurposeDefinition>;

export type MediaPurpose = keyof typeof MEDIA_PURPOSES;

export const MEDIA_PURPOSE_KEYS = Object.keys(MEDIA_PURPOSES) as [
  MediaPurpose,
  ...MediaPurpose[],
];

/** The definition widened to the interface, for code that reads any purpose. */
export function mediaPurposeOf(purpose: MediaPurpose): MediaPurposeDefinition {
  return MEDIA_PURPOSES[purpose];
}

/** Content types that are images (the ones that get variants when the purpose is public). */
export function isImageContentType(contentType: string): boolean {
  return contentType.startsWith("image/");
}
