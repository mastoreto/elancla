"use client";

import { KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AuthButton,
  AuthCard,
  AuthField,
  AuthNotice,
  authFieldIconClassName,
  describeAuthError,
} from "@/app/components";
import { authClient } from "@/lib/auth";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";

const twoFactorFormPage = {
  form: cn("flex flex-col gap-[18px]"),
  link: cn("text-[13px] font-bold text-primary hover:underline"),
  actions: cn("flex items-center justify-between gap-3"),
};

/** Second step of a login (password or Google): an authenticator code or a backup code. */
export function TwoFactorForm() {
  const router = useRouter();
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const trimmed = code.trim();
    const { error: verifyError } = useBackupCode
      ? await authClient.twoFactor.verifyBackupCode({ code: trimmed })
      : await authClient.twoFactor.verifyTotp({ code: trimmed });
    if (verifyError) {
      setError(describeAuthError(verifyError.code));
      setIsLoading(false);
      return;
    }
    router.push(getChurchRoutePath("resume"));
  }

  return (
    <AuthCard
      subtitle={
        useBackupCode
          ? "Escribe uno de tus códigos de respaldo."
          : "Escribe el código de tu aplicación de autenticación."
      }
      title="Verificación en dos pasos"
    >
      <form className={twoFactorFormPage.form} onSubmit={handleSubmit}>
        <AuthField
          autoComplete="one-time-code"
          icon={<KeyRound aria-hidden="true" className={authFieldIconClassName} />}
          id="code"
          inputMode={useBackupCode ? "text" : "numeric"}
          label={useBackupCode ? "Código de respaldo" : "Código de 6 dígitos"}
          onChange={(event) => setCode(event.target.value)}
          required={true}
          value={code}
        />
        {error ? <AuthNotice>{error}</AuthNotice> : null}
        <AuthButton disabled={isLoading} type="submit">
          {isLoading ? "Verificando..." : "Verificar"}
        </AuthButton>
        <div className={twoFactorFormPage.actions}>
          <button
            className={twoFactorFormPage.link}
            onClick={() => {
              setUseBackupCode((previous) => !previous);
              setCode("");
              setError(null);
            }}
            type="button"
          >
            {useBackupCode ? "Usar mi aplicación" : "Usar un código de respaldo"}
          </button>
          <Link className={twoFactorFormPage.link} href="/">
            Volver
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
