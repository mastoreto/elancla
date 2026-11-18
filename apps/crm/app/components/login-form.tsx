"use client";

import { authClient } from "@ancla/auth/client";
import { ArrowUpRight, Check, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/dashboard";
import { churchConfig, getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";

const loginFormPage = {
  container: cn("flex w-full max-w-[420px] flex-col gap-6"),
  brand: cn("flex flex-col items-center gap-2.5 text-center"),
  brandMark: cn("size-[60px] rounded-[19px]"),
  brandIcon: cn("size-8"),
  brandName: cn("font-display text-3xl font-semibold"),
  brandSubtitle: cn("text-sm text-[var(--tinta-apagada)]"),
  card: cn("rounded-[28px] bg-card p-[30px] shadow-(--sombra)"),
  form: cn("flex flex-col gap-[18px]"),
  heading: cn("flex flex-col gap-1"),
  title: cn("font-display text-[26px] font-medium"),
  subtitle: cn("text-sm text-[var(--tinta-suave)]"),
  field: cn("flex w-full flex-col gap-[7px]"),
  label: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  control: cn(
    "flex min-h-12 items-center gap-2.5 rounded-lg bg-card px-4 text-sm",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)] transition-shadow",
    "focus-within:shadow-[inset_0_0_0_1.5px_var(--granada),0_0_0_4px_var(--granada-100)]",
  ),
  controlIcon: cn("size-[17px] shrink-0 text-[var(--tinta-apagada)]"),
  input: cn(
    "min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-[var(--tinta-apagada)]",
  ),
  toggle: cn("text-[var(--tinta-apagada)] hover:text-foreground"),
  options: cn("flex items-center justify-between gap-3"),
  remember: cn("inline-flex cursor-pointer items-center gap-2.5 text-sm"),
  checkbox: cn(
    "inline-flex size-[22px] items-center justify-center rounded-[7px] text-white shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)]",
    "peer-checked:bg-(image:--grad-granada) peer-checked:shadow-none",
  ),
  forgot: cn("text-[13px] font-bold text-primary hover:underline"),
  error: cn("rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"),
  submit: cn(
    "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-(image:--grad-granada) px-6 text-base font-bold whitespace-nowrap text-white",
    "shadow-[0_10px_20px_-12px_rgba(194,58,78,0.9),inset_0_1px_0_rgba(255,255,255,0.25)] transition",
    "hover:-translate-y-px disabled:pointer-events-none disabled:opacity-60",
  ),
  help: cn("text-center text-[12.5px] text-[var(--tinta-apagada)]"),
};

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: signInError } = await authClient.signIn.email({ email, password, rememberMe });

    if (signInError) {
      setError(signInError.message ?? "No se pudo iniciar sesión. Verifica tus credenciales.");
      setIsLoading(false);
      return;
    }

    router.push(getChurchRoutePath("resume"));
  }

  return (
    <div className={loginFormPage.container}>
      <div className={loginFormPage.brand}>
        <BrandMark className={loginFormPage.brandMark} iconClassName={loginFormPage.brandIcon} />
        <b className={loginFormPage.brandName}>Iglesia {churchConfig.name}</b>
        <span className={loginFormPage.brandSubtitle}>Administración eclesiástica</span>
      </div>

      <div className={loginFormPage.card}>
        <form className={loginFormPage.form} onSubmit={handleSubmit}>
          <div className={loginFormPage.heading}>
            <h1 className={loginFormPage.title}>Bienvenido de vuelta</h1>
            <p className={loginFormPage.subtitle}>Inicia sesión en tu cuenta para continuar</p>
          </div>

          <label className={loginFormPage.field} htmlFor="email">
            <span className={loginFormPage.label}>Correo electrónico</span>
            <span className={loginFormPage.control}>
              <Mail aria-hidden="true" className={loginFormPage.controlIcon} />
              <input
                autoComplete="email"
                className={loginFormPage.input}
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="maria@elancla.org"
                required={true}
                type="email"
                value={email}
              />
            </span>
          </label>

          <label className={loginFormPage.field} htmlFor="password">
            <span className={loginFormPage.label}>Contraseña</span>
            <span className={loginFormPage.control}>
              <Lock aria-hidden="true" className={loginFormPage.controlIcon} />
              <input
                autoComplete="current-password"
                className={loginFormPage.input}
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Ingresa tu contraseña"
                required={true}
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className={loginFormPage.toggle}
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="size-4" />
                ) : (
                  <Eye aria-hidden="true" className="size-4" />
                )}
              </button>
            </span>
          </label>

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
                {rememberMe ? <Check aria-hidden="true" className="size-3.5" /> : null}
              </span>
              Recordarme
            </label>
            <button className={loginFormPage.forgot} type="button">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {error ? (
            <p className={loginFormPage.error} role="alert">
              {error}
            </p>
          ) : null}

          <button className={loginFormPage.submit} disabled={isLoading} type="submit">
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            <ArrowUpRight aria-hidden="true" className="size-[18px]" />
          </button>
        </form>
      </div>

      <p className={loginFormPage.help}>¿Problemas para entrar? Escribe a tu administrador.</p>
    </div>
  );
}
