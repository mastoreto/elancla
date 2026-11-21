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

const newPostButtonBlogPage = {
  icon: cn("size-4"),
};

/** Creates an empty post and opens it: its content is written afterwards, as a draft. */
export function NewPostButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function create(): Promise<void> {
    setBusy(true);
    try {
      const response = await apiClient.content.posts.$post();
      if (!response.ok) {
        toast.error(describeApiFailure(response.status, "No se pudo crear el artículo."));
        return;
      }
      const { id } = await response.json();
      router.push(getChurchRoutePath("blog", id));
    } catch {
      toast.error("No se pudo crear el artículo. Revisa tu conexión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <BoardButton
      data-testid="new-post-button"
      disabled={busy}
      onClick={() => void create()}
      variant="primary"
    >
      <Plus aria-hidden="true" className={newPostButtonBlogPage.icon} />
      Nuevo artículo
    </BoardButton>
  );
}
