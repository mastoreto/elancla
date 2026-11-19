"use client";

import { ArrowUpRight, Check, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { AuthButton } from "./auth-button";
import { AuthCard } from "./auth-card";
import { AuthField, authFieldIconClassName } from "./auth-field";
import { describeAuthError } from "./auth-messages";
import { AuthNotice } from "./auth-notice";

const loginFormPage = {
  form: cn("flex flex-col gap-[18px]"),
  toggle: cn("text-[var(--tinta-apagada)] hover:text-foreground"),
  toggleIcon: cn("size-4"),
  options: cn("flex items-center justify-between gap-3"),
  remember: cn("inline-flex cursor-pointer items-center gap-2.5 text-sm"),
  checkbox: cn(
    "inline-flex size-[22px] items-center justify-center rounded-[7px] text-white shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)]",
    "peer-checked:bg-(image:--grad-granada) peer-checked:shadow-none",
  ),
  checkIcon: cn("size-3.5"),
  forgot: cn("text-[13px] font-bold text-primary hover:underline"),
  submitIcon: cn("size-[18px]"),
  divider: cn("text-center text-xs text-[var(--tinta-apagada)]"),
};

interface LoginFormProps {
  /** Error code Better Auth put in the query string after a failed Google sign-in. */
  errorCode?: string;
  invitationAccepted?: boolean;
  passwordReset?: boolean;
}

export function LoginForm({ errorCode, invitationAccepted, passwordReset }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorCode ? describeAuthError(errorCode) : null,
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error: signInError } = await authClient.signIn.email({
      email,
      password,
      rememberMe,
    });

    if (signInError) {
      setError(describeAuthError(signInError.code));
      setIsLoading(false);
      return;
    }
    if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
      router.push("/two-factor");
      return;
    }
    router.push(getChurchRoutePath("resume"));
  }

  async function handleGoogle() {
    setError(null);
    const { error: googleError } = await authClient.signIn.social({
      provider: "google",
      callbackURL: getChurchRoutePath("resume"),
      // Better Auth appends `?error=<code>` to this URL when the redirect flow fails.
      errorCallbackURL: "/",
    });
    // On success the browser is already navigating to Google.
    if (googleError) setError(describeAuthError(googleError.code));
  }

  return (
    <AuthCard
      footer="¿Problemas para entrar? Escribe a tu administrador."
      subtitle="Inicia sesión en tu cuenta para continuar"
      title="Bienvenido de vuelta"
    >
      <form className={loginFormPage.form} onSubmit={handleSubmit}>
        {invitationAccepted ? (
          <AuthNotice tone="info">Tu cuenta está lista. Inicia sesión para entrar.</AuthNotice>
        ) : null}
        {passwordReset ? (
          <AuthNotice tone="info">Contraseña actualizada. Ya puedes iniciar sesión.</AuthNotice>
        ) : null}

        <AuthField
          autoComplete="email"
          icon={<Mail aria-hidden="true" className={authFieldIconClassName} />}
          id="email"
          label="Correo electrónico"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="maria@elancla.org"
          required={true}
          type="email"
          value={email}
        />

        <AuthField
          autoComplete="current-password"
          icon={<Lock aria-hidden="true" className={authFieldIconClassName} />}
          id="password"
          label="Contraseña"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Ingresa tu contraseña"
          required={true}
          trailing={
            <button
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className={loginFormPage.toggle}
              onClick={() => setShowPassword((visible) => !visible)}
              type="button"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className={loginFormPage.toggleIcon} />
              ) : (
                <Eye aria-hidden="true" className={loginFormPage.toggleIcon} />
              )}
            </button>
          }
          type={showPassword ? "text" : "password"}
          value={password}
        />

        <div className={loginFormPage.options}>
          <label className={loginFormPage.remember} htmlFor="remember">
            <input
              checked={rememberMe}
              className="peer sr-only"
              id="remember"
              onChange={(event) => setRememberMe(event.target.checked)}
              type="checkbox"
            />
            <span className={loginFormPage.checkbox}>
              {rememberMe ? <Check aria-hidden="true" className={loginFormPage.checkIcon} /> : null}
            </span>
            Recordarme
          </label>
          <Link className={loginFormPage.forgot} href="/reset-password">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {error ? <AuthNotice>{error}</AuthNotice> : null}

        <AuthButton disabled={isLoading} type="submit">
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          <ArrowUpRight aria-hidden="true" className={loginFormPage.submitIcon} />
        </AuthButton>
        <span className={loginFormPage.divider}>o</span>
        <AuthButton onClick={handleGoogle} variant="outline">
          Entrar con Google
        </AuthButton>
      </form>
    </AuthCard>
  );
}
