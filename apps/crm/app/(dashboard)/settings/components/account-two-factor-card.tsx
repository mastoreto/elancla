"use client";

import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { toast } from "sonner";
import { describeAuthError } from "@/app/components";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { BoardInput } from "@/components/dashboard/board/board-form";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { authClient } from "@/lib/auth";
import { cn } from "@/lib/utils";

const accountTwoFactorCardSettingsPage = {
  card: cn("flex flex-col gap-4 p-5"),
  header: cn("flex flex-wrap items-center justify-between gap-3"),
  title: cn("font-display text-lg font-medium"),
  hint: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  setup: cn("flex flex-col gap-3 rounded-[18px] bg-secondary/60 p-4"),
  qr: cn("w-fit rounded-lg bg-white p-3"),
  manualKey: cn("font-mono text-sm tracking-wider break-all select-all"),
  codes: cn("grid grid-cols-2 gap-1.5 font-mono text-sm sm:grid-cols-4"),
  warning: cn("text-[13px] font-semibold text-[var(--tinta-suave)]"),
  actions: cn("flex justify-end gap-2.5"),
  error: cn("text-xs font-semibold text-primary"),
  icon: cn("size-4"),
};

interface PendingSetup {
  totpURI: string;
  backupCodes: string[];
}

interface AccountTwoFactorCardProps {
  twoFactorEnabled: boolean;
  /** Accounts with a password must confirm it to turn two-factor on or off. */
  hasPassword: boolean;
}

export function AccountTwoFactorCard({ twoFactorEnabled, hasPassword }: AccountTwoFactorCardProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "confirmPassword" | "verify" | "disable">("idle");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [setup, setSetup] = useState<PendingSetup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  function reset() {
    setMode("idle");
    setPassword("");
    setCode("");
    setSetup(null);
    setError(null);
  }

  async function startSetup() {
    setIsWorking(true);
    setError(null);
    const { data, error: enableError } = await authClient.twoFactor.enable({
      // Google-only accounts have no password to confirm (server: allowPasswordless).
      password: hasPassword ? password : (undefined as unknown as string),
    });
    setIsWorking(false);
    if (enableError || data?.method !== "totp") {
      setError(describeAuthError(enableError?.code));
      return;
    }
    setSetup({ totpURI: data.totpURI, backupCodes: data.backupCodes ?? [] });
    setMode("verify");
  }

  async function confirmCode() {
    setIsWorking(true);
    setError(null);
    const { error: verifyError } = await authClient.twoFactor.verifyTotp({ code: code.trim() });
    setIsWorking(false);
    if (verifyError) {
      setError(describeAuthError(verifyError.code));
      return;
    }
    toast.success("Verificación en dos pasos activada");
    reset();
    router.refresh();
  }

  async function turnOff() {
    setIsWorking(true);
    setError(null);
    const { error: disableError } = await authClient.twoFactor.disable({
      password: hasPassword ? password : (undefined as unknown as string),
    });
    setIsWorking(false);
    if (disableError) {
      setError(describeAuthError(disableError.code));
      return;
    }
    toast.success("Verificación en dos pasos desactivada");
    reset();
    router.refresh();
  }

  const needsPasswordStep = mode === "confirmPassword" || mode === "disable";

  return (
    <BoardCard className={accountTwoFactorCardSettingsPage.card}>
      <div className={accountTwoFactorCardSettingsPage.header}>
        <div>
          <h2 className={accountTwoFactorCardSettingsPage.title}>Verificación en dos pasos</h2>
          <p className={accountTwoFactorCardSettingsPage.hint}>
            Pide un código de tu aplicación de autenticación al iniciar sesión, con contraseña o con
            Google.
          </p>
        </div>
        {twoFactorEnabled ? <StatusPill tone="green">Activada</StatusPill> : null}
        {mode === "idle" ? (
          <BoardButton
            onClick={() =>
              setMode(twoFactorEnabled ? "disable" : hasPassword ? "confirmPassword" : "verify")
            }
            size="sm"
            variant="outline"
          >
            {twoFactorEnabled ? "Desactivar" : "Activar"}
          </BoardButton>
        ) : null}
      </div>

      {needsPasswordStep ? (
        <form
          className={accountTwoFactorCardSettingsPage.setup}
          onSubmit={(event) => {
            event.preventDefault();
            void (mode === "disable" ? turnOff() : startSetup());
          }}
        >
          {hasPassword ? (
            <BoardInput
              autoComplete="current-password"
              id="two-factor-password"
              label="Confirma tu contraseña"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          ) : null}
          {error ? <span className={accountTwoFactorCardSettingsPage.error}>{error}</span> : null}
          <div className={accountTwoFactorCardSettingsPage.actions}>
            <BoardButton onClick={reset} size="sm" variant="ghost">
              Cancelar
            </BoardButton>
            <BoardButton
              disabled={isWorking}
              onClick={() => void (mode === "disable" ? turnOff() : startSetup())}
              size="sm"
              variant="primary"
            >
              {mode === "disable" ? "Desactivar" : "Continuar"}
            </BoardButton>
          </div>
        </form>
      ) : null}

      {mode === "verify" && !setup && !hasPassword ? (
        <div className={accountTwoFactorCardSettingsPage.setup}>
          {error ? <span className={accountTwoFactorCardSettingsPage.error}>{error}</span> : null}
          <div className={accountTwoFactorCardSettingsPage.actions}>
            <BoardButton onClick={reset} size="sm" variant="ghost">
              Cancelar
            </BoardButton>
            <BoardButton
              disabled={isWorking}
              onClick={() => void startSetup()}
              size="sm"
              variant="primary"
            >
              Generar código QR
            </BoardButton>
          </div>
        </div>
      ) : null}

      {mode === "verify" && setup ? (
        <div className={accountTwoFactorCardSettingsPage.setup}>
          <p className={accountTwoFactorCardSettingsPage.hint}>
            Escanea el código con tu aplicación de autenticación y escribe el código de 6 dígitos.
          </p>
          <div className={accountTwoFactorCardSettingsPage.qr}>
            <QRCodeSVG
              size={168}
              title="Código QR de verificación en dos pasos"
              value={setup.totpURI}
            />
          </div>
          <p className={accountTwoFactorCardSettingsPage.hint}>
            ¿No puedes escanearlo? Ingresa esta clave en la aplicación:
          </p>
          <code className={accountTwoFactorCardSettingsPage.manualKey}>
            {new URL(setup.totpURI).searchParams.get("secret")}
          </code>
          <p className={accountTwoFactorCardSettingsPage.warning}>
            Guarda estos códigos de respaldo. No volverás a verlos.
          </p>
          <ul className={accountTwoFactorCardSettingsPage.codes}>
            {setup.backupCodes.map((backupCode) => (
              <li key={backupCode}>{backupCode}</li>
            ))}
          </ul>
          <BoardInput
            autoComplete="one-time-code"
            icon={<KeyRound aria-hidden="true" className={accountTwoFactorCardSettingsPage.icon} />}
            id="two-factor-code"
            inputMode="numeric"
            label="Código de 6 dígitos"
            onChange={(event) => setCode(event.target.value)}
            value={code}
          />
          {error ? <span className={accountTwoFactorCardSettingsPage.error}>{error}</span> : null}
          <div className={accountTwoFactorCardSettingsPage.actions}>
            <BoardButton onClick={reset} size="sm" variant="ghost">
              Cancelar
            </BoardButton>
            <BoardButton
              disabled={isWorking || code.trim() === ""}
              onClick={() => void confirmCode()}
              size="sm"
              variant="primary"
            >
              Activar
            </BoardButton>
          </div>
        </div>
      ) : null}
    </BoardCard>
  );
}
