import { Body, Container, Head, Html, Link, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";
import { emailColors, emailFonts, emailStyles } from "../theme";

interface EmailLayoutProps {
  preview: string;
  churchName: string;
  recipientEmail: string;
  /** Why the person is getting this email, shown in the footer. */
  reason: string;
  children: ReactNode;
}

const brandStyles = {
  mark: {
    backgroundColor: emailColors.granada,
    borderRadius: "11px",
    color: emailColors.white,
    fontFamily: emailFonts.display,
    fontSize: "18px",
    fontWeight: 800,
    height: "34px",
    lineHeight: "34px",
    textAlign: "center",
    width: "34px",
  },
  name: {
    color: emailColors.tinta,
    fontFamily: emailFonts.display,
    fontSize: "18px",
    fontWeight: 600,
    lineHeight: "1.1",
    margin: 0,
  },
  caption: { color: emailColors.tintaApagada, fontSize: "11.5px", lineHeight: "1.3", margin: 0 },
  link: { color: emailColors.tintaApagada, textDecoration: "underline" },
  signature: { color: emailColors.tintaSuave, fontFamily: emailFonts.display, fontWeight: 600 },
} as const;

/** 600 px single column, church name first and iEkklesia as the signature. */
export function EmailLayout({
  preview,
  churchName,
  recipientEmail,
  reason,
  children,
}: EmailLayoutProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={emailStyles.body}>
        <Container style={emailStyles.container}>
          <table align="center" cellPadding={0} cellSpacing={0} role="presentation">
            <tbody>
              <tr>
                <td style={{ padding: "6px 10px 22px 0" }}>
                  <div style={brandStyles.mark}>i</div>
                </td>
                <td style={{ padding: "6px 0 22px" }}>
                  <Text style={brandStyles.name}>{churchName}</Text>
                  <Text style={brandStyles.caption}>en iEkklesia</Text>
                </td>
              </tr>
            </tbody>
          </table>

          <Section style={emailStyles.card}>{children}</Section>

          <Section style={{ padding: "22px 20px 6px" }}>
            <Text style={emailStyles.footer}>
              {reason} Enviado a <b style={{ color: emailColors.tintaSuave }}>{recipientEmail}</b>.
            </Text>
            <Text style={emailStyles.footer}>
              <Link href="https://app.iekklesia.com/preferencias" style={brandStyles.link}>
                Preferencias de correo
              </Link>{" "}
              ·{" "}
              <Link href="https://app.iekklesia.com/ayuda" style={brandStyles.link}>
                Ayuda
              </Link>
            </Text>
            <Text style={emailStyles.footer}>
              <span style={brandStyles.signature}>iEkklesia</span> · Administración eclesiástica con
              calma
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
