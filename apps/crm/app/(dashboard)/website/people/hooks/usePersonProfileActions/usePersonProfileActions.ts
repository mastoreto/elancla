"use client";

import type { UpsertPersonProfileBody } from "@ancla/contracts";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/apiClient";
import { describeApiFailure } from "@/lib/api/describeApiFailure";
import { getChurchRoutePath } from "@/lib/church";

const USER_ALREADY_LINKED_MESSAGE = "Ese usuario ya está vinculado a otra persona.";
const FALLBACK_MESSAGE = "No se pudo completar la acción. Revisa tu conexión.";

interface UsePersonProfileActions {
  busy: boolean;
  /** Creates the profile (`personId` is `null`) or replaces it; resolves to whether it worked. */
  save: (body: UpsertPersonProfileBody) => Promise<boolean>;
  remove: () => Promise<void>;
}

/** The network side of the person form: toast, navigation and the 409 (user already linked). */
export function usePersonProfileActions(personId: string | null): UsePersonProfileActions {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const listPath = getChurchRoutePath("website", "people");

  async function run(
    request: () => Promise<Response>,
    successMessage: string,
    onSuccess: () => void,
  ): Promise<boolean> {
    setBusy(true);
    try {
      const response = await request();
      if (!response.ok) {
        toast.error(describeApiFailure(response.status, USER_ALREADY_LINKED_MESSAGE));
        return false;
      }
      toast.success(successMessage);
      onSuccess();
      return true;
    } catch {
      toast.error(FALLBACK_MESSAGE);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function save(body: UpsertPersonProfileBody): Promise<boolean> {
    if (personId === null) {
      return run(
        () => apiClient.content.people.$post({ json: body }),
        "Persona creada",
        () => router.push(listPath),
      );
    }
    return run(
      () => apiClient.content.people[":id"].$patch({ param: { id: personId }, json: body }),
      "Persona actualizada",
      () => router.refresh(),
    );
  }

  async function remove(): Promise<void> {
    if (personId === null) return;
    await run(
      () => apiClient.content.people[":id"].$delete({ param: { id: personId } }),
      "Persona eliminada",
      () => router.push(listPath),
    );
  }

  return { busy, save, remove };
}
