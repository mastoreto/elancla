import { CircleCheck, KeyRound, MapPinOff, ShieldCheck, TriangleAlert } from "lucide-react";
import type { BoardTimelineItem } from "@/components/dashboard/board/board-timeline";

/** Accesses per minute for the live chart; the last six are the most recent. */
export const LIVE_ACCESS_BARS = [8, 14, 22, 40, 58, 46, 30, 36, 28, 34, 22, 18] as const;
export const LIVE_BARS_HISTORIC_COUNT = 6;

export const OPEN_ACTIVITY: BoardTimelineItem[] = [
  {
    id: "a1",
    icon: CircleCheck,
    tone: "green",
    title: "Acceso concedido",
    detail: "A 38 m del salón · Android",
    time: "10:51",
  },
  {
    id: "a2",
    icon: MapPinOff,
    tone: "gold",
    title: "Bloqueado por ubicación",
    detail: "A 3,1 km del lugar · iPhone",
    time: "10:50",
  },
  {
    id: "a3",
    icon: CircleCheck,
    tone: "green",
    title: "Acceso concedido",
    detail: "A 12 m del salón · iPhone",
    time: "10:49",
  },
  {
    id: "a4",
    icon: KeyRound,
    tone: "ink",
    title: "Código abierto",
    detail: "Habilitado por María García",
    time: "10:42",
  },
];

export const CLOSED_ACTIVITY: BoardTimelineItem[] = [
  {
    id: "c1",
    icon: TriangleAlert,
    tone: "gold",
    title: "Primer intento de acceso",
    detail: "Vio «aún no disponible»",
    time: "10:12",
  },
  {
    id: "c2",
    icon: ShieldCheck,
    tone: "green",
    title: "Informe asociado",
    detail: "Resumen general · noviembre 2026",
    time: "Hoy 09:20",
  },
  {
    id: "c3",
    icon: KeyRound,
    tone: "ink",
    title: "Código generado",
    detail: "ASM-7K4Q92 · María García",
    time: "Hoy 09:20",
  },
];

export const PLACE_SAMPLE = {
  radius: "150 m",
  address: "Av. Italia 3421",
  deviceLocation: "Obligatoria",
  storedData: "Ninguno",
  connected: 38,
  quorum: "78 / 120",
  enabledAt: "10:42",
  remaining: "02 h 41 min",
  closesAt: "14:00",
  closedAttempts: 3,
  closedDuration: "3 h 30",
} as const;
