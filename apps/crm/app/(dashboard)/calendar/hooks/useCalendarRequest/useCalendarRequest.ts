"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { describeCalendarFailure } from "../../lib/describeCalendarFailure";

const FALLBACK_MESSAGE = "No se pudo completar la acción. Revisa tu conexión.";

interface UseCalendarRequest {
  busy: boolean;
  /**
   * Runs the request, toasts the outcome and refreshes the server data. Resolves to the response,
   * or `null` when it failed. A `null` success message leaves the toast to the caller.
   */
  run: (
    request: () => Promise<Response>,
    successMessage: string | null,
  ) => Promise<Response | null>;
}

/** The network side of the calendar screens: years, reviews, events, schedule, places and copy. */
export function useCalendarRequest(): UseCalendarRequest {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(
    request: () => Promise<Response>,
    successMessage: string | null,
  ): Promise<Response | null> {
    setBusy(true);
    try {
      const response = await request();
      if (!response.ok) {
        toast.error(await describeCalendarFailure(response));
        return null;
      }
      if (successMessage !== null) toast.success(successMessage);
      router.refresh();
      return response;
    } catch {
      toast.error(FALLBACK_MESSAGE);
      return null;
    } finally {
      setBusy(false);
    }
  }

  return { busy, run };
}
