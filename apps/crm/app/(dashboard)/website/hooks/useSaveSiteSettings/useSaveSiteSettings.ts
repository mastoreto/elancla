"use client";

import { PERMISSIONS, type UpdateSiteSettingsBody } from "@ancla/contracts";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/apiClient";
import { describeApiFailure } from "@/lib/api/describeApiFailure";
import { useAccess } from "@/lib/authz/AccessProvider";
import { can } from "@/lib/authz/can";

export type SiteSettingsPart = Omit<UpdateSiteSettingsBody, "version">;

const STALE_VERSION_MESSAGE = "Alguien cambió la configuración, recargá la página.";
const FALLBACK_MESSAGE = "No se pudo guardar. Recarga la página.";

interface UseSaveSiteSettings {
  canEdit: boolean;
  saving: boolean;
  /** Sends one part of the settings with the loaded `version`; resolves to whether it was saved. */
  save: (part: SiteSettingsPart, successMessage: string) => Promise<boolean>;
}

/**
 * Shared by every card of /website: each one saves only its part, guarded by the optimistic lock.
 * The API answers with the new version, so a second save right after the first does not trip a 409
 * while the page refresh is still on its way.
 */
export function useSaveSiteSettings(loadedVersion: number): UseSaveSiteSettings {
  const router = useRouter();
  const access = useAccess();
  const [saving, setSaving] = useState(false);
  const [savedVersion, setSavedVersion] = useState(0);
  const version = Math.max(loadedVersion, savedVersion);

  async function save(part: SiteSettingsPart, successMessage: string): Promise<boolean> {
    setSaving(true);
    try {
      const response = await apiClient.site.settings.$patch({ json: { ...part, version } });
      if (!response.ok) {
        toast.error(describeApiFailure(response.status, STALE_VERSION_MESSAGE));
        return false;
      }
      setSavedVersion((await response.json()).version);
      toast.success(successMessage);
      router.refresh();
      return true;
    } catch {
      toast.error(FALLBACK_MESSAGE);
      return false;
    } finally {
      setSaving(false);
    }
  }

  return { canEdit: can(access, PERMISSIONS.site.edit), saving, save };
}
