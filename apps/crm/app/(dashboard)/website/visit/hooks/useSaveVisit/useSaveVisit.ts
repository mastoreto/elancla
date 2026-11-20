"use client";

import type { UpdateVisitBody } from "@ancla/contracts";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/apiClient";
import { describeApiFailure } from "@/lib/api/describeApiFailure";

const CONFLICT_MESSAGE = "Alguien cambió Visítanos, recarga la página.";
const FALLBACK_MESSAGE = "No se pudo guardar. Revisa tu conexión.";

interface UseSaveVisit {
  saving: boolean;
  /** Replaces the whole visit content; resolves to whether it was saved. */
  save: (body: UpdateVisitBody) => Promise<boolean>;
}

/** The network side of the visit form: one PUT with everything, toast and refresh. */
export function useSaveVisit(): UseSaveVisit {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function save(body: UpdateVisitBody): Promise<boolean> {
    setSaving(true);
    try {
      const response = await apiClient.site.visit.$put({ json: body });
      if (!response.ok) {
        toast.error(describeApiFailure(response.status, CONFLICT_MESSAGE));
        return false;
      }
      toast.success("Visítanos actualizado");
      router.refresh();
      return true;
    } catch {
      toast.error(FALLBACK_MESSAGE);
      return false;
    } finally {
      setSaving(false);
    }
  }

  return { saving, save };
}
