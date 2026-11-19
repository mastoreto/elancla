import type { CSSProperties } from "react";

// Email clients ignore CSS variables, so brand tokens are mirrored here as literals.
export const emailColors = {
  page: "#eee8e1",
  bruma: "#f6f1eb",
  tinta: "#23171a",
  tintaSuave: "#57474b",
  tintaApagada: "#76646a",
  granada: "#c23a4e",
  granada50: "#fcedef",
  oro: "#c9a14a",
  oro50: "#fbf3e1",
  oroTexto: "#80601a",
  vida: "#276d4c",
  vida50: "#e7f3ec",
  vino: "#25141a",
  line: "#ece7e4",
  white: "#ffffff",
} as const;

// Outfit / Plus Jakarta Sans where the client allows web fonts, safe fallbacks otherwise.
export const emailFonts = {
  display: "Outfit, 'Trebuchet MS', Arial, sans-serif",
  body: "'Plus Jakarta Sans', Arial, Helvetica, sans-serif",
} as const;

export type EmailTone = "gold" | "rose" | "green";

export const emailToneStyles = {
  gold: { band: "#fbf3e1", circle: "#f6dfa6", ink: "#80601a" },
  rose: { band: "#fcedef", circle: "#f6b9c3", ink: "#c23a4e" },
  green: { band: "#e7f3ec", circle: "#b3dfc4", ink: "#276d4c" },
} satisfies Record<EmailTone, { band: string; circle: string; ink: string }>;

export const emailStyles = {
  body: {
    backgroundColor: emailColors.page,
    fontFamily: emailFonts.body,
    margin: 0,
    padding: "28px 0",
    color: emailColors.tinta,
  },
  container: {
    maxWidth: "600px",
    width: "100%",
    margin: "0 auto",
    padding: "0 28px",
  },
  card: {
    backgroundColor: emailColors.white,
    borderRadius: "30px",
    overflow: "hidden",
  },
  content: { padding: "30px 38px 36px" },
  heading: {
    fontFamily: emailFonts.display,
    color: emailColors.tinta,
    fontSize: "30px",
    fontWeight: 600,
    lineHeight: "1.15",
    letterSpacing: "-0.015em",
    margin: "0 0 18px",
  },
  headingSmall: {
    fontFamily: emailFonts.display,
    color: emailColors.tinta,
    fontSize: "23px",
    fontWeight: 600,
    lineHeight: "1.15",
    margin: "0 0 18px",
  },
  sectionTitle: {
    fontFamily: emailFonts.display,
    color: emailColors.tinta,
    fontSize: "20px",
    fontWeight: 600,
    margin: "26px 0 12px",
  },
  text: {
    color: emailColors.tintaSuave,
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 18px",
  },
  small: {
    color: emailColors.tintaApagada,
    fontSize: "13px",
    lineHeight: "1.6",
    margin: "0 0 14px",
  },
  tiny: {
    color: emailColors.tintaApagada,
    fontSize: "12.5px",
    lineHeight: "1.6",
    margin: 0,
  },
  strong: { color: emailColors.tinta, fontWeight: 700 },
  // Solid colour, no gradient: Outlook drops gradients on buttons.
  button: {
    backgroundColor: emailColors.granada,
    borderRadius: "999px",
    color: emailColors.white,
    display: "inline-block",
    fontSize: "15px",
    fontWeight: 700,
    padding: "15px 30px",
    textDecoration: "none",
    textAlign: "center",
  },
  buttonDark: { backgroundColor: emailColors.tinta },
  buttonOutline: {
    backgroundColor: emailColors.white,
    color: emailColors.tinta,
    border: "1.5px solid #d8d0cc",
    padding: "13.5px 28.5px",
  },
  panel: {
    backgroundColor: emailColors.bruma,
    borderRadius: "20px",
    padding: "16px 18px",
    margin: "0 0 18px",
  },
  callout: {
    backgroundColor: emailColors.oro50,
    borderRadius: "20px",
    padding: "14px 16px",
    margin: "0 0 18px",
  },
  rule: { borderColor: emailColors.line, margin: "20px 0" },
  footer: {
    color: emailColors.tintaApagada,
    fontSize: "12px",
    lineHeight: "1.6",
    textAlign: "center",
    margin: "0 0 8px",
  },
} satisfies Record<string, CSSProperties>;
