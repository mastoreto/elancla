import { Section, Text } from "@react-email/components";
import { EmailHero } from "../components/email-hero";
import { EmailLayout } from "../components/email-layout";
import { EmailButton, EmailDetails } from "../components/email-parts";
import { emailStyles } from "../theme";

export interface PasswordResetEmailProps {
  churchName: string;
  recipientEmail: string;
  resetUrl: string;
  expiresInMinutes: number;
  device: string;
  location: string;
  requestedAt: string;
}

export function PasswordResetEmail({
  churchName,
  recipientEmail,
  resetUrl,
  expiresInMinutes,
  device,
  location,
  requestedAt,
}: PasswordResetEmailProps) {
  return (
    <EmailLayout
      churchName={churchName}
      preview={`El enlace vence en ${expiresInMinutes} minutos`}
      reason="Recibiste este correo porque alguien pidió restablecer tu contraseña."
      recipientEmail={recipientEmail}
    >
      <EmailHero glyph="•••" tone="rose" />
      <Section style={emailStyles.content}>
        <Text style={emailStyles.heading}>Restablece tu contraseña</Text>
        <Text style={emailStyles.text}>
          Recibimos una solicitud para cambiar la contraseña de tu cuenta. Elige una nueva con el
          botón de abajo.
        </Text>
        <EmailButton href={resetUrl}>Elegir nueva contraseña</EmailButton>
        <Text style={{ ...emailStyles.small, margin: "22px 0 18px" }}>
          El enlace vence en <b style={emailStyles.strong}>{expiresInMinutes} minutos</b> y solo se
          puede usar una vez.
        </Text>
        <EmailDetails
          rows={[
            { label: "Dispositivo", value: device },
            { label: "Lugar", value: location },
            { label: "Hora", value: requestedAt },
          ]}
          title="Solicitud recibida desde"
        />
        <Text
          style={{ ...emailStyles.callout, color: "#57474b", fontSize: "13px", lineHeight: "1.55" }}
        >
          <b style={emailStyles.strong}>¿No fuiste tú?</b> Ignora este correo: tu contraseña sigue
          igual. Si te preocupa, escríbenos y revisamos tu cuenta.
        </Text>
      </Section>
    </EmailLayout>
  );
}

PasswordResetEmail.PreviewProps = {
  churchName: "Iglesia El Ancla",
  recipientEmail: "maria@elancla.org",
  resetUrl: "https://app.iekklesia.com/restablecer/4b8e-22aa",
  expiresInMinutes: 30,
  device: "Chrome en Mac",
  location: "Montevideo, Uruguay",
  requestedAt: "17 nov 2026 · 09:12",
} satisfies PasswordResetEmailProps;
