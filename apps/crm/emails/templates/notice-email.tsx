import { Section, Text } from "@react-email/components";
import { EmailHero } from "../components/email-hero";
import { EmailLayout } from "../components/email-layout";
import { EmailBar, EmailButton, type EmailDetail, EmailDetails } from "../components/email-parts";
import { type EmailTone, emailColors, emailStyles, emailToneStyles } from "../theme";

export interface NoticeItem {
  initials: string;
  title: string;
  subtitle: string;
  amount: string;
  tone: EmailTone;
}

export interface NoticeEmailProps {
  churchName: string;
  recipientEmail: string;
  tone: EmailTone;
  glyph: string;
  title: string;
  message: string;
  /** Request-style rows (avatar, title, amount). */
  items?: NoticeItem[];
  /** Label / value panel. */
  details?: EmailDetail[];
  /** 0–100 progress drawn inside the details panel. */
  progress?: number;
  actionLabel: string;
  actionUrl: string;
  actionVariant?: "primary" | "dark";
}

const noticeStyles = {
  item: { backgroundColor: emailColors.bruma, borderRadius: "20px", padding: "12px 14px" },
  avatar: {
    borderRadius: "50%",
    fontSize: "13px",
    fontWeight: 800,
    height: "36px",
    width: "36px",
  },
  itemTitle: { fontSize: "14px", fontWeight: 700, lineHeight: "1.35", margin: 0 },
  itemSubtitle: { color: emailColors.tintaApagada, fontSize: "12.5px", margin: 0 },
  amount: { fontSize: "14px", fontWeight: 600, whiteSpace: "nowrap" },
} as const;

export function NoticeEmail({
  churchName,
  recipientEmail,
  tone,
  glyph,
  title,
  message,
  items,
  details,
  progress,
  actionLabel,
  actionUrl,
  actionVariant = "primary",
}: NoticeEmailProps) {
  return (
    <EmailLayout
      churchName={churchName}
      preview={message}
      reason="Recibes avisos importantes de tu iglesia."
      recipientEmail={recipientEmail}
    >
      <EmailHero compact={true} glyph={glyph} tone={tone} />
      <Section style={emailStyles.content}>
        <Text style={items ? emailStyles.heading : emailStyles.headingSmall}>{title}</Text>
        <Text style={emailStyles.text}>{message}</Text>

        {items ? (
          <table cellPadding={0} cellSpacing={0} role="presentation" style={{ width: "100%" }}>
            <tbody>
              {items.map((item) => {
                const colors = emailToneStyles[item.tone];
                return (
                  <tr key={item.title}>
                    <td style={{ paddingBottom: "8px" }}>
                      <table
                        cellPadding={0}
                        cellSpacing={0}
                        role="presentation"
                        style={{ ...noticeStyles.item, width: "100%" }}
                      >
                        <tbody>
                          <tr>
                            <td style={{ paddingRight: "12px", width: "36px" }}>
                              <div
                                style={{
                                  ...noticeStyles.avatar,
                                  backgroundColor: colors.circle,
                                  color: colors.ink,
                                  lineHeight: "36px",
                                  textAlign: "center",
                                }}
                              >
                                {item.initials}
                              </div>
                            </td>
                            <td>
                              <Text style={noticeStyles.itemTitle}>{item.title}</Text>
                              <Text style={noticeStyles.itemSubtitle}>{item.subtitle}</Text>
                            </td>
                            <td align="right" style={noticeStyles.amount}>
                              {item.amount}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}

        {details ? (
          <>
            <EmailDetails rows={details} />
            {progress === undefined ? null : (
              <div style={{ margin: "-6px 0 18px" }}>
                <EmailBar color={emailColors.oro} percent={progress} />
              </div>
            )}
          </>
        ) : null}

        <div style={{ paddingTop: "4px" }}>
          <EmailButton href={actionUrl} variant={actionVariant}>
            {actionLabel}
          </EmailButton>
        </div>
      </Section>
    </EmailLayout>
  );
}

const baseProps = { churchName: "Iglesia El Ancla", recipientEmail: "maria@elancla.org" } as const;

export const noticeVariants = {
  approvals: {
    ...baseProps,
    tone: "gold",
    glyph: "$",
    title: "3 solicitudes esperan tu aprobación",
    message: "Alabanza, Jóvenes y Misiones pidieron fondos esta semana.",
    items: [
      {
        initials: "LP",
        title: "Alquiler de sonido",
        subtitle: "Alabanza · Lucía Pérez",
        amount: "$ 320",
        tone: "rose",
      },
      {
        initials: "MS",
        title: "Campamento de jóvenes",
        subtitle: "Jóvenes · Martín Silva",
        amount: "$ 650",
        tone: "gold",
      },
      {
        initials: "JG",
        title: "Misión en Rivera",
        subtitle: "Misiones · Juan Gómez",
        amount: "$ 1.200",
        tone: "green",
      },
    ],
    actionLabel: "Revisar solicitudes",
    actionUrl: "https://app.iekklesia.com/solicitudes",
  },
  budget: {
    ...baseProps,
    tone: "gold",
    glyph: "!",
    title: "Alabanza casi agotó su presupuesto",
    message: "Usó el 86 % del presupuesto anual y quedan 6 semanas del año.",
    details: [
      { label: "Presupuesto", value: "$ 12.000" },
      { label: "Gastado", value: "$ 10.320" },
      { label: "Disponible", value: "$ 1.680" },
    ],
    progress: 86,
    actionLabel: "Ver presupuesto",
    actionUrl: "https://app.iekklesia.com/presupuestos",
  },
  reconcile: {
    ...baseProps,
    tone: "rose",
    glyph: "!",
    title: "No pudimos conciliar un movimiento",
    message: "El comprobante REC-0148 ya existe en otro movimiento de octubre.",
    details: [
      { label: "Movimiento", value: "Diezmos y ofrendas" },
      { label: "Monto", value: "$ 1.840" },
      { label: "Registró", value: "María Ruiz" },
    ],
    actionLabel: "Corregir movimiento",
    actionUrl: "https://app.iekklesia.com/movimientos",
    actionVariant: "dark",
  },
  approved: {
    ...baseProps,
    tone: "green",
    glyph: "✓",
    title: "Tu solicitud fue aprobada",
    message: "Tesorería aprobó “Alquiler de sonido” por $ 320. Los fondos ya están reservados.",
    details: [
      { label: "Aprobó", value: "María Ruiz" },
      { label: "Fecha", value: "17 nov 2026 · 12:40" },
      { label: "Presupuesto restante", value: "$ 1.360" },
    ],
    actionLabel: "Ver solicitud",
    actionUrl: "https://app.iekklesia.com/solicitudes",
  },
} satisfies Record<string, NoticeEmailProps>;

NoticeEmail.PreviewProps = noticeVariants.approvals satisfies NoticeEmailProps;
