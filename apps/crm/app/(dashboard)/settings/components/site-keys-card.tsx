"use client";

import type { SiteKeyDto } from "@ancla/contracts";
import { PERMISSIONS } from "@ancla/contracts";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import {
  BoardTableHead,
  BoardTableList,
  BoardTableRow,
} from "@/components/dashboard/board/board-table";
import { rowIconButtonClass } from "@/components/dashboard/board/row-icon-button";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { apiClient } from "@/lib/api/apiClient";
import { useAccess } from "@/lib/authz/AccessProvider";
import { can } from "@/lib/authz/can";
import { cn } from "@/lib/utils";

const COLUMNS = "1.4fr 1fr 1fr 1fr 56px";
const HEADERS = ["Nombre", "Clave", "Creada", "Estado", ""];

const siteKeysCardSettingsPage = {
  card: cn("flex flex-col gap-1 p-5"),
  title: cn("font-display text-lg font-medium"),
  description: cn("text-[13.5px] leading-normal text-[var(--tinta-suave)]"),
  name: cn("truncate"),
  hint: cn("font-mono text-[13px] text-[var(--tinta-suave)]"),
  muted: cn("text-[var(--tinta-suave)]"),
  status: cn("w-fit"),
  actions: cn("flex justify-end gap-1.5"),
  icon: cn("size-3.5"),
  empty: cn("py-6 text-center text-sm text-[var(--tinta-apagada)]"),
};

const dateFormat = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

interface SiteKeysCardProps {
  /** `null` when the caller may not see the keys (the API answered 403). */
  siteKeys: SiteKeyDto[] | null;
}

export function SiteKeysCard({ siteKeys }: SiteKeysCardProps) {
  const router = useRouter();
  const access = useAccess();
  const canRevoke = can(access, PERMISSIONS.siteKeys.delete);

  async function revoke(key: SiteKeyDto) {
    const response = await apiClient["site-keys"][":id"].$delete({ param: { id: key.id } });
    if (response.ok) {
      toast.success("Clave revocada");
      router.refresh();
    } else {
      toast.error("No se pudo revocar la clave.");
    }
  }

  return (
    <BoardCard className={siteKeysCardSettingsPage.card}>
      <h2 className={siteKeysCardSettingsPage.title}>Claves del sitio</h2>
      <p className={siteKeysCardSettingsPage.description}>
        Con una clave el sitio público lee el contenido de la iglesia. Para rotarla, crea la nueva,
        ponla en el sitio y revoca la anterior.
      </p>
      {siteKeys === null ? (
        <p className={siteKeysCardSettingsPage.empty}>Tu rol no permite ver las claves.</p>
      ) : siteKeys.length === 0 ? (
        <p className={siteKeysCardSettingsPage.empty}>Todavía no hay claves.</p>
      ) : (
        <>
          <BoardTableHead columns={COLUMNS} labels={HEADERS} />
          <BoardTableList>
            {siteKeys.map((key) => (
              <BoardTableRow columns={COLUMNS} key={key.id}>
                <span className={siteKeysCardSettingsPage.name}>{key.name}</span>
                <span className={siteKeysCardSettingsPage.hint}>{key.hint}</span>
                <span className={siteKeysCardSettingsPage.muted}>
                  {dateFormat.format(new Date(key.createdAt))}
                </span>
                <StatusPill
                  className={siteKeysCardSettingsPage.status}
                  tone={key.revokedAt ? "ink" : "green"}
                >
                  {key.revokedAt ? "Revocada" : "Activa"}
                </StatusPill>
                <div className={siteKeysCardSettingsPage.actions}>
                  {!key.revokedAt && canRevoke ? (
                    <BoardConfirmDialog
                      confirmLabel="Revocar"
                      description={`El sitio dejará de poder leer el contenido con la clave "${key.name}". Puede tardar unos minutos en notarse.`}
                      onConfirm={() => void revoke(key)}
                      title="Revocar clave"
                      trigger={
                        <button
                          aria-label={`Revocar ${key.name}`}
                          className={rowIconButtonClass}
                          type="button"
                        >
                          <Trash2 aria-hidden="true" className={siteKeysCardSettingsPage.icon} />
                        </button>
                      }
                    />
                  ) : null}
                </div>
              </BoardTableRow>
            ))}
          </BoardTableList>
        </>
      )}
    </BoardCard>
  );
}
