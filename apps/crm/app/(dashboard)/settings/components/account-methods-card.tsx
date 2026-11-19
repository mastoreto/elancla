"use client";

import type { SignInMethod } from "@ancla/contracts";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { describeAuthError } from "@/app/components";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { BoardInput } from "@/components/dashboard/board/board-form";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { apiClient } from "@/lib/api/apiClient";
import { authClient } from "@/lib/auth";
import { cn } from "@/lib/utils";

const MIN_PASSWORD_LENGTH = 12;
const HTTP_FORBIDDEN = 403;
const HTTP_CONFLICT = 409;

const accountMethodsCardSettingsPage = {
  card: cn("flex flex-col gap-4 p-5"),
  title: cn("font-display text-lg font-medium"),
  row: cn("flex flex-wrap items-center justify-between gap-3"),
  rowText: cn("flex flex-col gap-0.5"),
  rowTitle: cn("text-sm font-semibold"),
  rowHint: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  rowActions: cn("flex items-center gap-2.5"),
  form: cn("flex flex-col gap-3 rounded-[18px] bg-secondary/60 p-4"),
  formActions: cn("flex justify-end gap-2.5"),
  error: cn("text-xs font-semibold text-primary"),
};

interface AccountMethodsCardProps {
  methods: SignInMethod[];
}

export function AccountMethodsCard({ methods }: AccountMethodsCardProps) {
  const router = useRouter();
  const hasPassword = methods.includes("password");
  const hasGoogle = methods.includes("google");
  const [editing, setEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function closeForm() {
    setEditing(false);
    setCurrentPassword("");
    setNewPassword("");
    setError(null);
  }

  async function savePassword() {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(describeAuthError("PASSWORD_TOO_SHORT"));
      return;
    }
    setIsSaving(true);
    setError(null);
    let failure: string | null = null;
    if (hasPassword) {
      const { error: changeError } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (changeError) failure = describeAuthError(changeError.code);
    } else {
      const response = await apiClient.me.password.$post({ json: { newPassword } });
      if (response.status === HTTP_FORBIDDEN) failure = describeAuthError("SESSION_NOT_FRESH");
      else if (response.status === HTTP_CONFLICT) failure = "Tu cuenta ya tiene una contraseña.";
      else if (!response.ok) failure = describeAuthError(null);
    }
    setIsSaving(false);
    if (failure) {
      setError(failure);
      return;
    }
    toast.success(hasPassword ? "Contraseña actualizada" : "Contraseña creada");
    closeForm();
    router.refresh();
  }

  async function linkGoogle() {
    const { error: linkError } = await authClient.linkSocial({
      provider: "google",
      callbackURL: window.location.pathname,
      errorCallbackURL: window.location.pathname,
    });
    // On success the browser is already navigating to Google.
    if (linkError) toast.error(describeAuthError(linkError.code));
  }

  return (
    <BoardCard className={accountMethodsCardSettingsPage.card}>
      <h2 className={accountMethodsCardSettingsPage.title}>Métodos de acceso</h2>

      <div className={accountMethodsCardSettingsPage.row}>
        <div className={accountMethodsCardSettingsPage.rowText}>
          <span className={accountMethodsCardSettingsPage.rowTitle}>Contraseña</span>
          <span className={accountMethodsCardSettingsPage.rowHint}>
            {hasPassword
              ? "Puedes entrar con tu correo y contraseña."
              : "Aún no tienes contraseña."}
          </span>
        </div>
        <div className={accountMethodsCardSettingsPage.rowActions}>
          {hasPassword ? <StatusPill tone="green">Activa</StatusPill> : null}
          {editing ? null : (
            <BoardButton onClick={() => setEditing(true)} size="sm" variant="outline">
              {hasPassword ? "Cambiar contraseña" : "Crear contraseña"}
            </BoardButton>
          )}
        </div>
      </div>

      {editing ? (
        <form
          className={accountMethodsCardSettingsPage.form}
          onSubmit={(event) => {
            event.preventDefault();
            void savePassword();
          }}
        >
          {hasPassword ? (
            <BoardInput
              autoComplete="current-password"
              id="current-password"
              label="Contraseña actual"
              onChange={(event) => setCurrentPassword(event.target.value)}
              type="password"
              value={currentPassword}
            />
          ) : null}
          <BoardInput
            autoComplete="new-password"
            hint="Mínimo 12 caracteres."
            id="new-password"
            label="Nueva contraseña"
            onChange={(event) => setNewPassword(event.target.value)}
            type="password"
            value={newPassword}
          />
          {error ? <span className={accountMethodsCardSettingsPage.error}>{error}</span> : null}
          <div className={accountMethodsCardSettingsPage.formActions}>
            <BoardButton onClick={closeForm} size="sm" variant="ghost">
              Cancelar
            </BoardButton>
            <BoardButton
              disabled={isSaving}
              onClick={() => void savePassword()}
              size="sm"
              variant="primary"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </BoardButton>
          </div>
        </form>
      ) : null}

      <div className={accountMethodsCardSettingsPage.row}>
        <div className={accountMethodsCardSettingsPage.rowText}>
          <span className={accountMethodsCardSettingsPage.rowTitle}>Google</span>
          <span className={accountMethodsCardSettingsPage.rowHint}>
            {hasGoogle
              ? "Puedes entrar con tu cuenta de Google."
              : "Vincula la cuenta de Google con el mismo correo."}
          </span>
        </div>
        <div className={accountMethodsCardSettingsPage.rowActions}>
          {hasGoogle ? (
            <StatusPill tone="green">Vinculada</StatusPill>
          ) : (
            <BoardButton onClick={() => void linkGoogle()} size="sm" variant="outline">
              Vincular Google
            </BoardButton>
          )}
        </div>
      </div>
    </BoardCard>
  );
}
