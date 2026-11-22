import { DEFAULT_MINISTRY_COLOR, type MinistryColor } from "@ancla/contracts";

/**
 * The CRM does not load the web `@theme`, so the ministry color tokens are resolved here. The
 * values mirror `--color-<token>` of `apps/web/src/styles/global.css`; keep both in step.
 */
const MINISTRY_COLOR_VALUES = {
  "obra-red": "#a8141b",
  "obra-ink": "#151515",
  "obra-warm-line": "#3d3634",
  "obra-blush": "#fbe3e4",
  "secondary-300": "#c8bda9",
  "secondary-400": "#b19f86",
  "secondary-600": "#947a62",
  "secondary-700": "#7c6452",
  "secondary-800": "#655247",
  "secondary-900": "#53443b",
} satisfies Record<MinistryColor, string>;

/** The CSS color of a ministry token; no ministry (undefined) uses the default color. */
export function ministryColorValue(color: MinistryColor | undefined): string {
  return MINISTRY_COLOR_VALUES[color ?? DEFAULT_MINISTRY_COLOR];
}
