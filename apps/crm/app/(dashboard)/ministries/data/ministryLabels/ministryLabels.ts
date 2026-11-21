import type {
  LandingTile,
  LandingTone,
  MinistryColor,
  MinistryDestination,
  MinistryIcon,
} from "@ancla/contracts";

export const DESTINATION_LABELS: Record<MinistryDestination, string> = {
  page: "Página propia",
  external: "Enlace externo",
  none: "Sin enlace",
};

export const ICON_LABELS: Record<MinistryIcon, string> = {
  adolescentes: "Adolescentes",
  alabanza: "Alabanza",
  "espacio-mujer": "Espacio Mujer",
  ensenanza: "Enseñanza",
  hombres: "Hombres",
  jovenes: "Jóvenes",
  misiones: "Misiones",
  multimedia: "Multimedia",
  predicacion: "Predicación",
  servicio: "Servicio",
};

export const COLOR_LABELS: Record<MinistryColor, string> = {
  "obra-red": "Rojo",
  "obra-ink": "Tinta",
  "obra-warm-line": "Línea cálida",
  "obra-blush": "Rubor",
  "secondary-300": "Secundario 300",
  "secondary-400": "Secundario 400",
  "secondary-600": "Secundario 600",
  "secondary-700": "Secundario 700",
  "secondary-800": "Secundario 800",
  "secondary-900": "Secundario 900",
};

export const TONE_LABELS: Record<LandingTone, string> = {
  mist: "Niebla",
  ink: "Tinta",
  red: "Rojo",
};

export const TILE_LABELS: Record<LandingTile, string> = {
  color: "Color",
  photo: "Foto",
};
