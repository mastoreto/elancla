"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { describeApiFailure } from "@/lib/api/describeApiFailure";

const FALLBACK_MESSAGE = "No se pudo completar la acción. Revisa tu conexión.";

interface EventRequestMessages {
  success: string;
  /** What a 409 means in this action. */
  conflict: string;
}

interface UseEventRequest {
  busy: boolean;
  /** Runs the request; toasts the outcome and refreshes the server data. Resolves to whether it worked. */
  run: (request: () => Promise<Response>, messages: EventRequestMessages) => Promise<boolean>;
}

/** The network side of the visibility card and of deleting an event. */
export function useEventRequest(): UseEventRequest {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(
    request: () => Promise<Response>,
    { success, conflict }: EventRequestMessages,
  ): Promise<boolean> {
    setBusy(true);
    try {
      const response = await request();
      if (!response.ok) {
        toast.error(describeApiFailure(response.status, conflict));
        return false;
      }
      toast.success(success);
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
