"use client";

import type { InvitationPreviewDto } from "@ancla/contracts";
import { Lock, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AuthButton,
  AuthCard,
  AuthField,
  AuthNotice,
  authFieldIconClassName,
  describeAuthError,
} from "@/app/components";
import { apiClient } from "@/lib/api/apiClient";
import { authClient } from "@/lib/auth";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";

const MIN_PASSWORD_LENGTH = 12;
const HTTP_TOO_MANY_REQUESTS = 429;

const invitationAcceptPage = {
  form: cn("flex flex-col gap-[18px]"),
  invited: cn("rounded-lg bg-[var(--oro-50)] px-4 py-3 text-sm text-[var(--tinta-suave)]"),
  strong: cn("font-bold text-foreground"),
  divider: cn("text-center text-xs text-[var(--tinta-apagada)]"),
  back: cn("text-[13px] font-bold text-primary hover:underline"),
};

type PreviewState =
  | { status: "loading" }
  | { status: "invalid" }
  | { status: "ready"; preview: InvitationPreviewDto };

export function InvitationAccept({ token }: { token: string }) {
  const router = useRouter();
  const [state, setState] = useState<PreviewState>({ status: "loading" });
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ponytail: fetched in the browser on purpose. The public endpoints are rate limited by client
  // IP, and a server-side call would carry no client IP (every visitor would share one bucket).
  useEffect(() => {
    let cancelled = false;
    apiClient.invitations["by-token"][":token"]
      .$get({ param: { token } })
      .then(async (response) => {
        if (cancelled) return;
        setState(
          response.ok ? { status: "ready", preview: await response.json() } : { status: "invalid" },
        );
      })
      .catch(() => !cancelled && setState({ status: "invalid" }));
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(describeAuthError("PASSWORD_TOO_SHORT"));
      return;
    }
    setIsLoading(true);
    const response = await apiClient.invitations["by-token"][":token"].accept.$post({
      param: { token },
      json: { name, password },
    });
    if (response.ok) {
      router.push("/?invited=1");
      return;
    }
    setIsLoading(false);
    setError(
      response.status === HTTP_TOO_MANY_REQUESTS
        ? describeAuthError("too_many_requests")
        : describeAuthError("INVALID_TOKEN"),
    );
  }

  async function handleGoogle() {
    // The invitation is matched by the Google account's email in the sign-up hook (core/auth).
    const { error: googleError } = await authClient.signIn.social({
      provider: "google",
      callbackURL: getChurchRoutePath("resume"),
      errorCallbackURL: "/",
      requestSignUp: true,
    });
    if (googleError) setError(describeAuthError(googleError.code));
  }

  if (state.status === "loading") {
    return <AuthCard title="Invitación">{null}</AuthCard>;
  }

  if (state.status === "invalid") {
    return (
      <AuthCard title="Enlace no válido">
        <div className={invitationAcceptPage.form}>
          <AuthNotice>{describeAuthError("INVALID_TOKEN")}</AuthNotice>
          <Link className={invitationAcceptPage.back} href="/">
            Ir al inicio de sesión
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard subtitle={`Te invitaron a ${state.preview.organizationName}`} title="Crea tu cuenta">
      <form className={invitationAcceptPage.form} onSubmit={handleSubmit}>
        <p className={invitationAcceptPage.invited}>
          Invitación para{" "}
          <span className={invitationAcceptPage.strong}>{state.preview.maskedEmail}</span>
        </p>
        <AuthField
          autoComplete="name"
          icon={<User aria-hidden="true" className={authFieldIconClassName} />}
          id="name"
          label="Nombre y apellido"
          onChange={(event) => setName(event.target.value)}
          required={true}
          value={name}
        />
        <AuthField
          autoComplete="new-password"
          icon={<Lock aria-hidden="true" className={authFieldIconClassName} />}
          id="password"
          label="Contraseña (mínimo 12 caracteres)"
          minLength={MIN_PASSWORD_LENGTH}
          onChange={(event) => setPassword(event.target.value)}
          required={true}
          type="password"
          value={password}
        />
        {error ? <AuthNotice>{error}</AuthNotice> : null}
        <AuthButton disabled={isLoading} type="submit">
          {isLoading ? "Creando cuenta..." : "Crear cuenta"}
        </AuthButton>
        <span className={invitationAcceptPage.divider}>o</span>
        <AuthButton onClick={handleGoogle} variant="outline">
          Continuar con Google
        </AuthButton>
      </form>
    </AuthCard>
  );
}
