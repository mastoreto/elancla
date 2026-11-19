import type { MediaVariantDto } from "@ancla/contracts";

/**
 * Key of the original, in the private bucket. The file id is a UUIDv7 that is never reused and the
 * content never changes, so keys are safe for immutable caching without hashing the content.
 */
export function originalKey(organizationId: string, fileId: string): string {
  return `${organizationId}/${fileId}`;
}

/** Key of a variant, in the public bucket (the same prefix as the original, a different bucket). */
export function variantKey(
  organizationId: string,
  fileId: string,
  width: number,
  format: MediaVariantDto["format"],
): string {
  return `${organizationId}/${fileId}/${width}.${format}`;
}
