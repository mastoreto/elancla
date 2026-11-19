"use client";

import type { InvitationDto, InvitationStatus } from "@ancla/contracts";
import { Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import {
  BoardTableHead,
  BoardTableList,
  BoardTableRow,
} from "@/components/dashboard/board/board-table";
import { RowIconButton, rowIconButtonClass } from "@/components/dashboard/board/row-icon-button";
import { StatusPill, type StatusPillTone } from "@/components/dashboard/board/status-pill";
import { apiClient } from "@/lib/api/apiClient";
import { cn } from "@/lib/utils";
import { INVITATION_ROLE_LABELS, INVITATION_STATUS_LABELS } from "../data/invitation-roles";

const COLUMNS = "1.6fr 1fr 1fr 1fr 84px";
const HEADERS = ["Correo", "Rol", "Vence", "Estado", ""];

const STATUS_TONES = {
  pending: "gold",
  accepted: "green",
  revoked: "ink",
  expired: "rose",
} satisfies Record<InvitationStatus, StatusPillTone>;

const invitationsPanelSettingsPage = {
  card: cn("flex flex-col gap-1 p-5"),
  title: cn("font-display text-lg font-medium"),
  email: cn("truncate"),
  muted: cn("text-[var(--tinta-suave)]"),
  status: cn("w-fit"),
  actions: cn("flex justify-end gap-1.5"),
  icon: cn("size-3.5"),
  empty: cn("py-6 text-center text-sm text-[var(--tinta-apagada)]"),
};

const dateFormat = new Intl.DateTimeFormat("es", { day: "numeric", month: "short" });

interface InvitationsPanelProps {
  /** `null` when the caller is not an administrator (the API answered 403). */
  invitations: InvitationDto[] | null;
}

export function InvitationsPanel({ invitations }: InvitationsPanelProps) {
  const router = useRouter();

  async function run(action: () => Promise<Response>, success: string) {
    const response = await action();
    if (response.ok) {
      toast.success(success);
      router.refresh();
    } else {
      toast.error("No se pudo completar la acción.");
    }
  }

  return (
    <BoardCard className={invitationsPanelSettingsPage.card}>
      <h2 className={invitationsPanelSettingsPage.title}>Invitaciones</h2>
      {invitations === null ? (
        <p className={invitationsPanelSettingsPage.empty}>
          Solo los administradores pueden ver y enviar invitaciones.
        </p>
      ) : invitations.length === 0 ? (
        <p className={invitationsPanelSettingsPage.empty}>Todavía no hay invitaciones.</p>
      ) : (
        <>
          <BoardTableHead columns={COLUMNS} labels={HEADERS} />
          <BoardTableList>
            {invitations.map((invitation) => {
              const canAct = invitation.status === "pending" || invitation.status === "expired";
              return (
                <BoardTableRow columns={COLUMNS} key={invitation.id}>
                  <span className={invitationsPanelSettingsPage.email}>{invitation.email}</span>
                  <span className={invitationsPanelSettingsPage.muted}>
                    {INVITATION_ROLE_LABELS[invitation.role]}
                  </span>
                  <span className={invitationsPanelSettingsPage.muted}>
                    {dateFormat.format(new Date(invitation.expiresAt))}
                  </span>
                  <StatusPill
                    className={invitationsPanelSettingsPage.status}
                    tone={STATUS_TONES[invitation.status]}
                  >
                    {INVITATION_STATUS_LABELS[invitation.status]}
                  </StatusPill>
                  <div className={invitationsPanelSettingsPage.actions}>
                    {canAct ? (
                      <>
                        <RowIconButton
                          label={`Reenviar a ${invitation.email}`}
                          onClick={() =>
                            run(
                              () =>
                                apiClient.invitations[":id"].resend.$post({
                                  param: { id: invitation.id },
                                }),
                              "Invitación reenviada",
                            )
                          }
                        >
                          <Send aria-hidden="true" className={invitationsPanelSettingsPage.icon} />
                        </RowIconButton>
                        <BoardConfirmDialog
                          confirmLabel="Revocar"
                          description={`El enlace enviado a ${invitation.email} dejará de funcionar.`}
                          onConfirm={() =>
                            run(
                              () =>
                                apiClient.invitations[":id"].revoke.$post({
                                  param: { id: invitation.id },
                                }),
                              "Invitación revocada",
                            )
                          }
                          title="Revocar invitación"
                          trigger={
                            <button
                              aria-label={`Revocar ${invitation.email}`}
                              className={rowIconButtonClass}
                              type="button"
                            >
                              <Trash2
                                aria-hidden="true"
                                className={invitationsPanelSettingsPage.icon}
                              />
                            </button>
                          }
                        />
                      </>
                    ) : null}
                  </div>
                </BoardTableRow>
              );
            })}
          </BoardTableList>
        </>
      )}
    </BoardCard>
  );
}
