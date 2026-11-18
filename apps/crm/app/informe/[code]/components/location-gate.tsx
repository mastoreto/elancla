"use client";

import { MapPin, RotateCw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ALLOWED_RADIUS_METERS, churchCoordinates } from "../data/church-location";
import { distanceInMeters, formatDistance } from "../utils";
import { PublicButton } from "./public-actions";
import { PublicMap } from "./public-map";
import { PublicShell } from "./public-shell";
import { PublicStateScreen } from "./public-state-screen";

type Phase =
  | { kind: "ask" }
  | { kind: "checking" }
  | { kind: "far"; meters: number | null }
  | { kind: "granted" };

const locationGateInformePage = {
  note: cn(
    "flex items-start gap-2.5 rounded-[20px] bg-card p-3.5 px-4 text-left shadow-(--sombra)",
  ),
  noteIcon: cn("mt-0.5 size-[18px] shrink-0 text-[var(--vida)]"),
  noteText: cn("text-[12.5px] leading-normal text-[var(--tinta-suave)]"),
  noteStrong: cn("text-foreground"),
  distance: cn(
    "flex items-center gap-2.5 rounded-full bg-[var(--granada-50)] px-4 py-3 text-[13px] font-bold text-primary",
  ),
  stack: cn("flex w-full flex-col items-center gap-[18px]"),
};

interface LocationGateProps {
  /** Rendered once the visitor is confirmed to be at the assembly. */
  children: React.ReactNode;
}

export function LocationGate({ children }: LocationGateProps) {
  const [phase, setPhase] = useState<Phase>({ kind: "ask" });

  function requestLocation() {
    if (!navigator.geolocation) {
      setPhase({ kind: "far", meters: null });
      return;
    }

    setPhase({ kind: "checking" });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const meters = distanceInMeters(churchCoordinates, {
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setPhase(meters <= ALLOWED_RADIUS_METERS ? { kind: "granted" } : { kind: "far", meters });
      },
      () => setPhase({ kind: "far", meters: null }),
      { timeout: 10_000 },
    );
  }

  if (phase.kind === "granted") {
    return children;
  }

  if (phase.kind === "far") {
    return (
      <PublicShell>
        <PublicStateScreen
          body="Este informe se puede ver únicamente estando físicamente en el templo durante la sesión. Acércate al lugar y reintenta."
          icon={<MapPin aria-hidden="true" className="size-9" />}
          title="Solo disponible en la asamblea"
          tone="rose"
        >
          <div className={locationGateInformePage.stack}>
            <PublicMap />
            <div className={locationGateInformePage.distance}>
              <MapPin aria-hidden="true" className="size-4" />
              {phase.meters === null
                ? "No pudimos comprobar tu ubicación"
                : `Estás a ${formatDistance(phase.meters)} del lugar`}
            </div>
            <PublicButton onClick={requestLocation}>
              <RotateCw aria-hidden="true" className="size-4" />
              Reintentar ubicación
            </PublicButton>
          </div>
        </PublicStateScreen>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <PublicStateScreen
        body="Para ver este informe necesitamos comprobar tu ubicación una vez."
        icon={<MapPin aria-hidden="true" className="size-9" />}
        title="Confirmemos que estás en la asamblea"
        tone="rose"
      >
        <div className={locationGateInformePage.note}>
          <ShieldCheck aria-hidden="true" className={locationGateInformePage.noteIcon} />
          <span className={locationGateInformePage.noteText}>
            Usamos tu ubicación solo para comprobar que estás en el templo.{" "}
            <b className={locationGateInformePage.noteStrong}>No la guardamos.</b>
          </span>
        </div>
        <PublicButton
          disabled={phase.kind === "checking"}
          onClick={requestLocation}
          variant="primary"
        >
          <MapPin aria-hidden="true" className="size-[18px]" />
          {phase.kind === "checking" ? "Comprobando…" : "Permitir ubicación"}
        </PublicButton>
        <PublicButton onClick={() => setPhase({ kind: "far", meters: null })} variant="ghost">
          Ahora no
        </PublicButton>
      </PublicStateScreen>
    </PublicShell>
  );
}
