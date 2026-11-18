import { Ban, Clock, MapPinOff, SearchX } from "lucide-react";
import type { PublicAccessState } from "@/app/(dashboard)/assembly/types";
import { cn } from "@/lib/utils";

type BlockedState = Exclude<PublicAccessState, "visible">;

const MESSAGES = {
  "not-yet": {
    icon: Clock,
    title: "Este informe aún no está disponible",
    body: "Se habilitará cuando comience la sesión. Vuelve a escanear el código en ese momento.",
  },
  expired: {
    icon: MapPinOff,
    title: "Este informe ya venció",
    body: "El acceso era válido solo durante la sesión y en el lugar de la asamblea.",
  },
  revoked: {
    icon: Ban,
    title: "Este informe fue dado de baja",
    body: "La iglesia retiró el acceso. Consulta con la secretaría si necesitas una copia.",
  },
  invalid: {
    icon: SearchX,
    title: "No encontramos ese código",
    body: "Revisa que esté bien escrito o escanea de nuevo el QR proyectado en la sala.",
  },
} satisfies Record<BlockedState, { icon: typeof Clock; title: string; body: string }>;

const publicAccessMessageInformePage = {
  card: cn(
    "flex flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center shadow-card",
  ),
  icon: cn("size-10 text-muted-foreground"),
  title: cn("font-display text-2xl font-medium text-balance"),
  body: cn("text-sm leading-6 text-muted-foreground"),
};

interface PublicAccessMessageProps {
  state: BlockedState;
}

export function PublicAccessMessage({ state }: PublicAccessMessageProps) {
  const message = MESSAGES[state];
  const Icon = message.icon;

  return (
    <div className={publicAccessMessageInformePage.card}>
      <Icon aria-hidden="true" className={publicAccessMessageInformePage.icon} />
      <h1 className={publicAccessMessageInformePage.title}>{message.title}</h1>
      <p className={publicAccessMessageInformePage.body}>{message.body}</p>
    </div>
  );
}
