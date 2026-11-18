import { Body, Container, Head, Html, Preview, Text } from "@react-email/components";
import type { ReactNode } from "react";
import { emailStyles } from "../theme";

interface EmailLayoutProps {
  preview: string;
  churchName: string;
  children: ReactNode;
}

export function EmailLayout({ preview, churchName, children }: EmailLayoutProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={emailStyles.body}>
        <Container style={emailStyles.container}>
          <Text style={emailStyles.brand}>{churchName}</Text>
          {children}
          <Text style={emailStyles.footer}>
            Recibes este correo porque formas parte de {churchName}. Si no esperabas este mensaje,
            puedes ignorarlo.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
