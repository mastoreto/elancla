import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "../components/email-layout";
import { emailStyles } from "../theme";

export interface ReportEmailProps {
  churchName: string;
  reportTitle: string;
  assemblyName: string;
  accessCode: string;
  validity: string;
  place: string;
  reportUrl: string;
}

export function ReportEmail({
  churchName,
  reportTitle,
  assemblyName,
  accessCode,
  validity,
  place,
  reportUrl,
}: ReportEmailProps) {
  return (
    <EmailLayout churchName={churchName} preview={`Informe: ${reportTitle}`}>
      <Heading style={emailStyles.heading}>{reportTitle}</Heading>
      <Text style={emailStyles.text}>
        {assemblyName}. El informe estará disponible con tu código, solo durante la sesión y en{" "}
        {place}.
      </Text>
      <Section style={emailStyles.panel}>
        <Text style={emailStyles.code}>{accessCode}</Text>
        <Text style={emailStyles.text}>Vigencia: {validity}</Text>
      </Section>
      <Button href={reportUrl} style={emailStyles.button}>
        Abrir informe
      </Button>
    </EmailLayout>
  );
}

ReportEmail.PreviewProps = {
  churchName: "Iglesia El Ancla",
  reportTitle: "Informe financiero 2026",
  assemblyName: "Asamblea ordinaria · 24 nov",
  accessCode: "ASM-7K4Q92",
  validity: "24 nov 10:30 – 14:00",
  place: "Templo El Ancla",
  reportUrl: "https://example.com/informe/ASM-7K4Q92",
} satisfies ReportEmailProps;
