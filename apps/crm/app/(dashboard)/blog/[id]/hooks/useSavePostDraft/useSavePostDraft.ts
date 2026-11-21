"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { describeEditorialFailure } from "@/components/editorial/editorial-status-bar/utils";
import { apiClient } from "@/lib/api/apiClient";

const FALLBACK_MESSAGE = "No se pudo guardar el borrador. Revisa tu conexión.";

interface UseSavePostDraft {
  busy: boolean;
  /** Saves the snapshot as the working draft; resolves to whether it worked. */
  save: (snapshot: Record<string, unknown>) => Promise<boolean>;
}

/** The network side of "Guardar borrador": toast and refresh of the editorial status. */
export function useSavePostDraft(postId: string): UseSavePostDraft {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function save(snapshot: Record<string, unknown>): Promise<boolean> {
    setBusy(true);
    try {
      const response = await apiClient.editorial[":type"][":entityId"].draft.$put({
        param: { type: "blog-post", entityId: postId },
        json: { snapshot },
      });
      if (!response.ok) {
        toast.error(await describeEditorialFailure(response));
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
