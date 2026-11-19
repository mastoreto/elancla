export interface MediaOrigins {
  uploadOrigin?: string;
  mediaOrigin?: string;
}

function originOf(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value).origin;
  } catch {
    // A malformed value must widen nothing: the CSP simply does not get the origin.
    return undefined;
  }
}

/**
 * Origins the CSP must allow for media, read from the same variables the API uses: the host the
 * browser uploads to (`S3_PRESIGN_ENDPOINT`, falling back to `S3_ENDPOINT`) and the public media
 * base (`MEDIA_PUBLIC_BASE_URL`).
 */
export function readMediaOrigins(env: Record<string, string | undefined>): MediaOrigins {
  return {
    uploadOrigin: originOf(env.S3_PRESIGN_ENDPOINT || env.S3_ENDPOINT),
    mediaOrigin: originOf(env.MEDIA_PUBLIC_BASE_URL),
  };
}
