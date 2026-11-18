import { AlertTriangle, Lock, Mail, Trash2 } from "lucide-react";
import type { PublicAccessState } from "@/app/(dashboard)/assembly/types";
import { cn } from "@/lib/utils";
import { PublicButton } from "./public-actions";
import { PublicCodeForm } from "./public-code-form";
import { PublicRetryButton } from "./public-retry-button";
import { PublicShell } from "./public-shell";
import { PublicStateScreen } from "./public-state-screen";

type BlockedState = Exclude<PublicAccessState, "visible">;

const publicAccessMessageInformePage = {
  chip: cn(
    "inline-flex items-center gap-2 rounded-full bg-[var(--oro-50)] px-4 py-2 text-[12.5px] font-bold text-[var(--oro-texto)]",
    "shadow-[inset_0_0_0_1px_var(--oro-100)]",
  ),
  chipDot: cn("size-1.5 rounded-full bg-[var(--oro)]"),
  hint: cn("text-xs text-[var(--tinta-apagada)]"),
  meta: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
};

interface PublicAccessMessageProps {
  state: BlockedState;
  /** Access code and validity of the report, when the code matched one. */
  accessCode?: string;
  validity?: string;
}

export function PublicAccessMessage({ state, accessCode, validity }: PublicAccessMessageProps) {
  if (state === "not-yet") {
    return (
      <PublicShell withGlow={true}>
        <PublicStateScreen
          body="Se habilitará cuando comience la presentación. Mantén esta pantalla abierta."
          icon={<Lock aria-hidden="true" className="size-10" />}
          title="Este informe aún no está disponible para su acceso"
          tone="gold"
        >
          {accessCode ? (
            <span className={publicAccessMessageInformePage.chip}>
              <span className={publicAccessMessageInformePage.chipDot} />
              Código {accessCode}
            </span>
          ) : null}
          <PublicRetryButton />
          <span className={publicAccessMessageInformePage.hint}>
            Esta página se actualiza sola cuando se habilite.
          </span>
        </PublicStateScreen>
      </PublicShell>
    );
  }

  if (state === "expired") {
    return (
      <PublicShell>
        <PublicStateScreen
          body="La asamblea terminó y el acceso a este informe fue cerrado."
          icon={<Lock aria-hidden="true" className="size-10" />}
          title="Este informe ya no está disponible"
          tone="ink"
        >
          {accessCode ? (
            <span className={publicAccessMessageInformePage.meta}>
              Código {accessCode}
              {validity ? ` · ${validity}` : ""}
            </span>
          ) : null}
        </PublicStateScreen>
      </PublicShell>
    );
  }

  if (state === "revoked") {
    return (
      <PublicShell>
        <PublicStateScreen
          body="Quien lo publicó retiró el acceso. Si lo necesitas, pídelo a la directiva."
          icon={<Trash2 aria-hidden="true" className="size-10" />}
          title="Este informe fue dado de baja"
          tone="rose"
        >
          <PublicButton>
            <Mail aria-hidden="true" className="size-4" />
            Contactar a la iglesia
          </PublicButton>
        </PublicStateScreen>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <PublicStateScreen
        body="Revisa que esté bien escrito o escanea de nuevo el QR de la pantalla."
        icon={<AlertTriangle aria-hidden="true" className="size-10" />}
        title="No encontramos este código"
        tone="gold"
      >
        <PublicCodeForm />
      </PublicStateScreen>
    </PublicShell>
  );
}
