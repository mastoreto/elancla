import type { SiteKeyDto } from "@ancla/contracts";
import type { SiteApiKey } from "@ancla/db";
import { siteKeyHint } from "../../domain";

/** Explicit field list: the secret hash never leaves the API. */
export function toSiteKeyDto(key: SiteApiKey): SiteKeyDto {
  return {
    id: key.id,
    name: key.name,
    hint: siteKeyHint(key.id),
    createdAt: key.createdAt.toISOString(),
    revokedAt: key.revokedAt?.toISOString() ?? null,
  };
}
