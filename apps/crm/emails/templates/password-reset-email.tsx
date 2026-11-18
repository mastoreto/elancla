import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "../components/email-layout";
import { emailStyles } from "../theme";

export interface PasswordResetEmailProps {
  churchName: string;
  recipientName: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export function PasswordResetEmail({
  churchName,
  recipientName,
  resetUrl,
  expiresInMinutes,
}: PasswordResetEmailProps) {
  return (
    <EmailLayout churchName={churchName} preview="Restablece tu contraseña">
      <Heading style={emailStyles.heading}>Restablece tu contraseña</Heading>
      <Text style={emailStyles.text}>
        Hola {recipientName}, recibimos un pedido para cambiar tu contraseña. El enlace vence en{" "}
        {expiresInMinutes} minutos.
      </Text>
      <Button href={resetUrl} style={emailStyles.button}>
        Crear nueva contraseña
      </Button>
      <Text style={emailStyles.footer}>
        Si no fuiste tú, ignora este correo: tu cuenta sigue segura.
      </Text>
    </EmailLayout>
  );
}

PasswordResetEmail.PreviewProps = {
  churchName: "Iglesia El Ancla",
  recipientName: "Lucía",
  resetUrl: "https://example.com/restablecer",
  expiresInMinutes: 30,
} satisfies PasswordResetEmailProps;
