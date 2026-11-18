import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "../components/email-layout";
import { emailStyles } from "../theme";

export interface InvitationEmailProps {
  churchName: string;
  recipientName: string;
  roleName: string;
  acceptUrl: string;
}

export function InvitationEmail({
  churchName,
  recipientName,
  roleName,
  acceptUrl,
}: InvitationEmailProps) {
  return (
    <EmailLayout churchName={churchName} preview={`Te invitaron a ${churchName}`}>
      <Heading style={emailStyles.heading}>Te damos la bienvenida, {recipientName}</Heading>
      <Text style={emailStyles.text}>
        Te invitaron a colaborar en la gestión de {churchName} con el rol de {roleName}. Activa tu
        cuenta para crear tu contraseña y empezar.
      </Text>
      <Button href={acceptUrl} style={emailStyles.button}>
        Activar mi cuenta
      </Button>
    </EmailLayout>
  );
}

InvitationEmail.PreviewProps = {
  churchName: "Iglesia El Ancla",
  recipientName: "Lucía",
  roleName: "Operadora de Cajas",
  acceptUrl: "https://example.com/activar",
} satisfies InvitationEmailProps;
