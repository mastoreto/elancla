import type { EditorialActionDto, EditorialStateDto } from "@ancla/contracts";
import type { StatusPillTone } from "@/components/dashboard/board/status-pill";

export const EDITORIAL_STATE_LABELS: Record<EditorialStateDto, string> = {
  draft: "Borrador",
  in_review: "En revisión",
  changes_requested: "Cambios pedidos",
  published: "Publicado",
  paused: "Pausado",
  superseded: "Reemplazado",
};

export const EDITORIAL_STATE_TONES: Record<EditorialStateDto, StatusPillTone> = {
  draft: "ink",
  in_review: "gold",
  changes_requested: "rose",
  published: "green",
  paused: "gold",
  superseded: "ink",
};

export const EDITORIAL_ACTION_LABELS: Record<EditorialActionDto, string> = {
  saveDraft: "Guardar borrador",
  submit: "Enviar a revisión",
  publish: "Publicar",
  approve: "Aprobar",
  requestChanges: "Pedir cambios",
  pause: "Pausar",
  resume: "Reanudar",
};

export function stateLabel(state: EditorialStateDto): string {
  return EDITORIAL_STATE_LABELS[state];
}

export function stateTone(state: EditorialStateDto): StatusPillTone {
  return EDITORIAL_STATE_TONES[state];
}

export function actionLabel(action: EditorialActionDto): string {
  return EDITORIAL_ACTION_LABELS[action];
}
