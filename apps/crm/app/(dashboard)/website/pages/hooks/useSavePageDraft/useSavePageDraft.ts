"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/apiClient";
import { describeApiFailure } from "@/lib/api/describeApiFailure";

const CONFLICT_MESSAGE = "Alguien cambió esta página mientras tanto. Recarga la página.";
const FALLBACK_MESSAGE = "No se pudo guardar el borrador. Revisa tu conexión.";

interface UseSavePageDraft {
  busy: boolean;
  /** Saves the snapshot as the working draft; resolves to whether it worked. */
  save: (snapshot: Record<string, unknown>) => Promise<boolean>;
}

/** The network side of "Guardar borrador": toast and refresh of the editorial status. */
export function useSavePageDraft(pageId: string): UseSavePageDraft {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function save(snapshot: Record<string, unknown>): Promise<boolean> {
    setBusy(true);
    try {
      const response = await apiClient.editorial[":type"][":entityId"].draft.$put({
        param: { type: "simple-page", entityId: pageId },
        json: { snapshot },
      });
      if (!response.ok) {
        toast.error(describeApiFailure(response.status, CONFLICT_MESSAGE));
        return false;
      }
      toast.success("Borrador guardado");
      router.refresh();
      return true;
    } catch {
      toast.error(FALLBACK_MESSAGE);
      return false;
    } finally {
      setBusy(false);
    }
  }

  return { busy, save };
}
