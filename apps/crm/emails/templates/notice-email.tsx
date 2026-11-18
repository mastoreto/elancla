import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "../components/email-layout";
import { emailStyles } from "../theme";

export interface NoticeItem {
  title: string;
  detail: string;
}

export interface NoticeEmailProps {
  churchName: string;
  recipientName: string;
  notices: NoticeItem[];
  panelUrl: string;
}

export function NoticeEmail({ churchName, recipientName, notices, panelUrl }: NoticeEmailProps) {
  return (
    <EmailLayout churchName={churchName} preview={`${notices.length} avisos pendientes`}>
      <Heading style={emailStyles.heading}>Tienes avisos pendientes</Heading>
      <Text style={emailStyles.text}>Hola {recipientName}, esto necesita tu atención:</Text>
      {notices.map((notice) => (
        <Section key={notice.title} style={emailStyles.panel}>
          <Text style={emailStyles.text}>
            <strong>{notice.title}</strong>
            <br />
            {notice.detail}
          </Text>
        </Section>
      ))}
      <Button href={panelUrl} style={emailStyles.button}>
        Ir al panel
      </Button>
    </EmailLayout>
  );
}

NoticeEmail.PreviewProps = {
  churchName: "Iglesia El Ancla",
  recipientName: "María",
  notices: [
    { title: "3 solicitudes por aprobar", detail: "La más antigua lleva 4 días." },
    { title: "Cierre de período", detail: "Vence el 30 de noviembre." },
  ],
  panelUrl: "https://example.com/panel",
} satisfies NoticeEmailProps;
