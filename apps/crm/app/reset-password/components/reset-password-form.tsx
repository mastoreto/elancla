"use client";

import { Lock, Mail } from "lucide-react";
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
import { cn } from "@/lib/utils";

const MIN_PASSWORD_LENGTH = 12;

const resetPasswordFormPage = {
  form: cn("flex flex-col gap-[18px]"),
  link: cn("text-[13px] font-bold text-primary hover:underline"),
};

interface ResetPasswordFormProps {
  /** Reset token from the emailed link; without it the form asks for the email instead. */
  token?: string;
  errorCode?: string;
}

export function ResetPasswordForm({ token, errorCode }: ResetPasswordFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(
    errorCode ? describeAuthError(errorCode) : null,
  );
  const [isLoading, setIsLoading] = useState(false);

  async function requestLink(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const { error: requestError } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsLoading(false);
    if (requestError) {
      setError(describeAuthError(requestError.code));
      return;
    }
    setSent(true);
  }

  async function setNewPassword(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    setIsLoading(true);
    setError(null);
    const { error: resetError } = await authClient.resetPassword({ newPassword: password, token });
    if (resetError) {
      setError(describeAuthError(resetError.code));
      setIsLoading(false);
      return;
    }
    router.push("/?reset=1");
  }

  if (token) {
    return (
      <AuthCard subtitle="Elige una contraseña de al menos 12 caracteres." title="Nueva contraseña">
        <form className={resetPasswordFormPage.form} onSubmit={setNewPassword}>
          <AuthField
            autoComplete="new-password"
            icon={<Lock aria-hidden="true" className={authFieldIconClassName} />}
            id="password"
            label="Nueva contraseña"
            minLength={MIN_PASSWORD_LENGTH}
            onChange={(event) => setPassword(event.target.value)}
            required={true}
            type="password"
            value={password}
          />
          {error ? <AuthNotice>{error}</AuthNotice> : null}
          <AuthButton disabled={isLoading} type="submit">
            {isLoading ? "Guardando..." : "Guardar contraseña"}
          </AuthButton>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      subtitle="Te enviaremos un enlace para elegir una contraseña nueva."
      title="Recuperar contraseña"
    >
      <form className={resetPasswordFormPage.form} onSubmit={requestLink}>
        {sent ? (
          <AuthNotice tone="info">
            Si el correo tiene una cuenta, recibirás un enlace en unos minutos.
          </AuthNotice>
        ) : null}
        <AuthField
          autoComplete="email"
          icon={<Mail aria-hidden="true" className={authFieldIconClassName} />}
          id="email"
          label="Correo electrónico"
          onChange={(event) => setEmail(event.target.value)}
          required={true}
          type="email"
          value={email}
        />
        {error ? <AuthNotice>{error}</AuthNotice> : null}
        <AuthButton disabled={isLoading} type="submit">
          {isLoading ? "Enviando..." : "Enviar enlace"}
        </AuthButton>
        <Link className={resetPasswordFormPage.link} href="/">
          Volver al inicio de sesión
        </Link>
      </form>
    </AuthCard>
  );
}
