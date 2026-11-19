import { Button, Link } from "@react-email/components";
import type { ReactNode } from "react";
import { emailColors, emailStyles } from "../theme";

interface EmailButtonProps {
  href: string;
  variant?: "primary" | "dark" | "outline";
  children: ReactNode;
}

export function EmailButton({
  href,
  variant = "primary",
  children,
}: EmailButtonProps) {
  const style = {
    ...emailStyles.button,
    ...(variant === "dark" ? emailStyles.buttonDark : {}),
    ...(variant === "outline" ? emailStyles.buttonOutline : {}),
  };
  return (
    <Button href={href} style={style}>
      {children}
    </Button>
  );
}

export interface EmailDetail {
  label: string;
  value: string;
}

/** Soft panel with label / value rows (device, amount, dates…). */
export function EmailDetails({
  title,
  rows,
}: {
  title?: string;
  rows: EmailDetail[];
}) {
  return (
    <table
      cellPadding={0}
      cellSpacing={0}
      role="presentation"
      style={{ ...emailStyles.panel, width: "100%" }}
    >
      <tbody>
        {title ? (
          <tr>
            <td
              colSpan={2}
              style={{
                color: emailColors.tintaApagada,
                fontSize: "11.5px",
                fontWeight: 800,
                letterSpacing: "0.1em",
                padding: "0 0 8px",
                textTransform: "uppercase",
              }}
            >
              {title}
            </td>
          </tr>
        ) : null}
        {rows.map((row) => (
          <tr key={row.label}>
            <td
              style={{
                color: emailColors.tintaApagada,
                fontSize: "13.5px",
                padding: "5px 0",
              }}
            >
              {row.label}
            </td>
            <td
              align="right"
              style={{ fontSize: "13.5px", fontWeight: 700, padding: "5px 0" }}
            >
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Horizontal bar for budget execution (nested table: widths survive Outlook). */
export function EmailBar({
  percent,
  color,
}: {
  percent: number;
  color: string;
}) {
  const width = Math.max(0, Math.min(100, percent));
  return (
    <table
      cellPadding={0}
      cellSpacing={0}
      role="presentation"
      style={{
        backgroundColor: emailColors.bruma,
        borderRadius: "999px",
        height: "10px",
        width: "100%",
      }}
    >
      <tbody>
        <tr>
          <td
            style={{
              backgroundColor: color,
              borderRadius: "999px",
              fontSize: 0,
              height: "10px",
              lineHeight: 0,
              width: `${width}%`,
            }}
          >
            &nbsp;
          </td>
          <td style={{ fontSize: 0 }}>&nbsp;</td>
        </tr>
      </tbody>
    </table>
  );
}

export function EmailFallbackLink({ url }: { url: string }) {
  return (
    <>
      ¿El botón no funciona? Copia este enlace en tu navegador:
      <br />
      <Link
        href={url}
        style={{ color: emailColors.granada, wordBreak: "break-all" }}
      >
        {url}
      </Link>
    </>
  );
}
