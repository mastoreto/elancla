"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { apiClient } from "@/lib/api/apiClient";
import { describeApiFailure } from "@/lib/api/describeApiFailure";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";

const newPageButtonWebsitePage = {
  icon: cn("size-4"),
};

/** Creates an empty page and opens it: its content is written afterwards, as a draft. */
export function NewPageButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function create(): Promise<void> {
    setBusy(true);
    try {
      const response = await apiClient.content.pages.$post();
      if (!response.ok) {
        toast.error(describeApiFailure(response.status, "No se pudo crear la página."));
        return;
      }
      const { id } = await response.json();
      router.push(getChurchRoutePath("website", "pages", id));
    } catch {
      toast.error("No se pudo crear la página. Revisa tu conexión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <BoardButton
      data-testid="new-page-button"
      disabled={busy}
      onClick={() => void create()}
      variant="primary"
    >
      <Plus aria-hidden="true" className={newPageButtonWebsitePage.icon} />
      Nueva página
    </BoardButton>
  );
}
