import type { CSSProperties } from "react";

// Email clients ignore CSS variables, so brand tokens are mirrored here as literals.
export const emailColors = {
  lino: "#fcfaf7",
  bruma: "#f6f1eb",
  tinta: "#23171a",
  tintaSuave: "#58454a",
  granada: "#c23a4e",
  oro: "#c9a14a",
  white: "#ffffff",
} as const;

export const emailStyles = {
  body: {
    backgroundColor: emailColors.bruma,
    fontFamily: "Georgia, 'Times New Roman', serif",
    margin: 0,
    padding: "32px 0",
  },
  container: {
    backgroundColor: emailColors.white,
    borderRadius: "16px",
    maxWidth: "560px",
    margin: "0 auto",
    padding: "32px",
  },
  brand: {
    color: emailColors.granada,
    fontSize: "13px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    margin: "0 0 24px",
  },
  heading: {
    color: emailColors.tinta,
    fontSize: "26px",
    lineHeight: "1.25",
    margin: "0 0 16px",
  },
  text: {
    color: emailColors.tintaSuave,
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 16px",
  },
  button: {
    backgroundColor: emailColors.granada,
    borderRadius: "999px",
    color: emailColors.white,
    display: "inline-block",
    fontSize: "15px",
    fontWeight: 600,
    padding: "12px 24px",
    textDecoration: "none",
  },
  panel: {
    backgroundColor: emailColors.bruma,
    borderRadius: "12px",
    padding: "16px",
    margin: "0 0 16px",
  },
  code: {
    color: emailColors.tinta,
    fontFamily: "'Courier New', monospace",
    fontSize: "20px",
    letterSpacing: "0.12em",
    margin: 0,
  },
  footer: {
    color: emailColors.tintaSuave,
    fontSize: "12px",
    margin: "24px 0 0",
  },
} satisfies Record<string, CSSProperties>;
