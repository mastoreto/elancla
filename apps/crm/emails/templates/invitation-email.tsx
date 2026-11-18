import { Hr, Section, Text } from "@react-email/components";
import { EmailHero } from "../components/email-hero";
import { EmailLayout } from "../components/email-layout";
import { EmailButton, EmailFallbackLink } from "../components/email-parts";
import { emailColors, emailStyles } from "../theme";

export interface InvitationEmailProps {
  churchName: string;
  recipientName: string;
  recipientEmail: string;
  inviterName: string;
  roleName: string;
  roleDescription: string;
  acceptUrl: string;
  expiresInDays: number;
}

const pillStyle = {
  backgroundColor: emailColors.granada50,
  borderRadius: "999px",
  color: emailColors.granada,
  display: "inline-block",
  fontSize: "12px",
  fontWeight: 700,
  padding: "4px 10px",
} as const;

export function InvitationEmail({
  churchName,
  recipientName,
  recipientEmail,
  inviterName,
  roleName,
  roleDescription,
  acceptUrl,
  expiresInDays,
}: InvitationEmailProps) {
  return (
    <EmailLayout
      churchName={churchName}
      preview={`${inviterName} te invitó a iEkklesia`}
      reason="Recibiste este correo porque te invitaron a una cuenta."
      recipientEmail={recipientEmail}
    >
      <EmailHero glyph="⌂" tone="gold" />
      <Section style={emailStyles.content}>
        <Text style={emailStyles.heading}>
          {recipientName}, te invitaron a cuidar las cuentas de {churchName}
        </Text>
        <Text style={emailStyles.text}>
          <b style={emailStyles.strong}>{inviterName}</b> te sumó al equipo de iEkklesia con el rol
          de:
        </Text>
        <Text style={{ ...emailStyles.small, margin: "0 0 22px" }}>
          <span style={pillStyle}>{roleName}</span> &nbsp;{roleDescription}
        </Text>
        <EmailButton href={acceptUrl}>Crear mi cuenta</EmailButton>
        <Text style={{ ...emailStyles.small, margin: "22px 0 0" }}>
          Este enlace vence en <b style={emailStyles.strong}>{expiresInDays} días</b>. Si no
          esperabas esta invitación, puedes ignorar este correo.
        </Text>
        <Hr style={emailStyles.rule} />
        <Text style={emailStyles.tiny}>
          <EmailFallbackLink url={acceptUrl} />
        </Text>
      </Section>
    </EmailLayout>
  );
}

InvitationEmail.PreviewProps = {
  churchName: "Iglesia El Ancla",
  recipientName: "María",
  recipientEmail: "maria@elancla.org",
  inviterName: "Pastor Daniel Rivas",
  roleName: "Tesorería",
  roleDescription: "Registra y aprueba movimientos",
  acceptUrl: "https://app.iekklesia.com/invitacion/9f3a-c71d",
  expiresInDays: 7,
} satisfies InvitationEmailProps;
