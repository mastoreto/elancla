"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { describeTaxonomyFailure } from "../../lib/describeTaxonomyFailure";

const FALLBACK_MESSAGE = "No se pudo completar la acción. Revisa tu conexión.";

interface UseTaxonomyRequest {
  busy: boolean;
  /** Runs the request; toasts the outcome and refreshes the list. Resolves to whether it worked. */
  run: (request: () => Promise<Response>, successMessage: string) => Promise<boolean>;
}

/** The network side of the taxonomy forms: busy flag, toasts and the refresh of the server data. */
export function useTaxonomyRequest(): UseTaxonomyRequest {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(request: () => Promise<Response>, successMessage: string): Promise<boolean> {
    setBusy(true);
    try {
      const response = await request();
      if (!response.ok) {
        toast.error(await describeTaxonomyFailure(response));
        return false;
      }
      toast.success(successMessage);
      router.refresh();
      return true;
    } catch {
      toast.error(FALLBACK_MESSAGE);
      return false;
    } finally {
      setBusy(false);
    }
  }

  return { busy, run };
}
