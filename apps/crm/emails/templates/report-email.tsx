import { Section, Text } from "@react-email/components";
import { EmailLayout } from "../components/email-layout";
import { EmailBar, EmailButton } from "../components/email-parts";
import { emailColors, emailFonts, emailStyles } from "../theme";

export interface ReportKpi {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
}

export interface ReportHighlight {
  title: string;
  amount: string;
  positive: boolean;
}

export interface ReportMinistry {
  name: string;
  percent: number;
}

export interface ReportEmailProps {
  churchName: string;
  recipientName: string;
  recipientEmail: string;
  periodLabel: string;
  kpis: ReportKpi[];
  /** One value per week, drawn as bars (the highest is highlighted). */
  weeklyOfferings: number[];
  highlights: ReportHighlight[];
  ministries: ReportMinistry[];
  attention: string;
  reportUrl: string;
  pdfUrl: string;
}

const BAR_AREA_HEIGHT = 82;

const reportStyles = {
  hero: { backgroundColor: emailColors.vino, padding: "30px 38px 28px" },
  heroLabel: {
    color: "#f2e1b6",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.14em",
    margin: "0 0 8px",
    textTransform: "uppercase",
  },
  heroTitle: {
    color: emailColors.white,
    fontFamily: emailFonts.display,
    fontSize: "38px",
    fontWeight: 600,
    letterSpacing: "-0.02em",
    lineHeight: "1.05",
    margin: "0 0 8px",
  },
  heroText: { color: "#d2c7ca", fontSize: "14px", margin: 0 },
  kpi: { backgroundColor: emailColors.bruma, borderRadius: "20px", padding: "14px 14px 12px" },
  kpiLabel: { color: emailColors.tintaApagada, fontSize: "12px", margin: "0 0 4px" },
  kpiValue: {
    fontFamily: emailFonts.display,
    fontSize: "22px",
    fontWeight: 600,
    margin: "0 0 4px",
    whiteSpace: "nowrap",
  },
  trend: { color: emailColors.vida, fontSize: "12px", fontWeight: 700, margin: 0 },
  caption: { color: emailColors.tintaApagada, fontSize: "11.5px", textAlign: "center" },
  row: { borderBottom: `1px solid ${emailColors.line}`, padding: "10px 0", fontSize: "14px" },
} as const;

function barColor(percent: number): string {
  if (percent >= 100) return emailColors.granada;
  if (percent >= 80) return emailColors.oro;
  return emailColors.vida;
}

export function ReportEmail({
  churchName,
  recipientName,
  recipientEmail,
  periodLabel,
  kpis,
  weeklyOfferings,
  highlights,
  ministries,
  attention,
  reportUrl,
  pdfUrl,
}: ReportEmailProps) {
  const peak = Math.max(...weeklyOfferings, 1);

  return (
    <EmailLayout
      churchName={churchName}
      preview={`Resumen de ${periodLabel}`}
      reason="Recibes este informe el primer día de cada mes."
      recipientEmail={recipientEmail}
    >
      <Section style={reportStyles.hero}>
        <Text style={reportStyles.heroLabel}>Informe mensual</Text>
        <Text style={reportStyles.heroTitle}>{periodLabel}</Text>
        <Text style={reportStyles.heroText}>
          Un mes de cuentas en paz, {recipientName}. Aquí está el resumen.
        </Text>
      </Section>

      <Section style={emailStyles.content}>
        <table
          cellPadding={0}
          cellSpacing={8}
          role="presentation"
          style={{ margin: "0 -8px", width: "calc(100% + 16px)" }}
        >
          <tbody>
            <tr>
              {kpis.map((kpi) => (
                <td
                  key={kpi.label}
                  style={{ verticalAlign: "top", width: `${100 / kpis.length}%` }}
                >
                  <div style={reportStyles.kpi}>
                    <Text style={reportStyles.kpiLabel}>{kpi.label}</Text>
                    <Text style={reportStyles.kpiValue}>{kpi.value}</Text>
                    <Text style={reportStyles.trend}>
                      {kpi.trend === "up" ? "▲" : "▼"} {kpi.delta}
                    </Text>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <Text style={emailStyles.sectionTitle}>Ofrendas por semana</Text>
        <table cellPadding={0} cellSpacing={0} role="presentation" style={{ width: "100%" }}>
          <tbody>
            <tr>
              {weeklyOfferings.map((value, index) => (
                <td
                  align="center"
                  key={`week-${index + 1}`}
                  style={{
                    height: `${BAR_AREA_HEIGHT + 20}px`,
                    padding: "0 5px",
                    verticalAlign: "bottom",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: value === peak ? emailColors.granada : "#eba0ac",
                      borderRadius: "8px 8px 0 0",
                      height: `${Math.round((value / peak) * BAR_AREA_HEIGHT)}px`,
                    }}
                  />
                  <Text style={{ ...reportStyles.caption, margin: "6px 0 0" }}>S{index + 1}</Text>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <Text style={emailStyles.sectionTitle}>Movimientos destacados</Text>
        <table cellPadding={0} cellSpacing={0} role="presentation" style={{ width: "100%" }}>
          <tbody>
            {highlights.map((item) => (
              <tr key={item.title}>
                <td style={{ ...reportStyles.row, fontWeight: 600 }}>{item.title}</td>
                <td
                  align="right"
                  style={{
                    ...reportStyles.row,
                    color: item.positive ? emailColors.vida : emailColors.granada,
                  }}
                >
                  {item.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Text style={emailStyles.sectionTitle}>Ejecución por ministerio</Text>
        <table cellPadding={0} cellSpacing={0} role="presentation" style={{ width: "100%" }}>
          <tbody>
            {ministries.map((ministry) => (
              <tr key={ministry.name}>
                <td style={{ fontSize: "13px", padding: "5px 10px 5px 0", width: "96px" }}>
                  {ministry.name}
                </td>
                <td style={{ padding: "5px 0" }}>
                  <EmailBar color={barColor(ministry.percent)} percent={ministry.percent} />
                </td>
                <td
                  align="right"
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    padding: "5px 0 5px 10px",
                    width: "44px",
                  }}
                >
                  {ministry.percent} %
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Text
          style={{
            ...emailStyles.callout,
            margin: "18px 0 20px",
            fontSize: "13.5px",
            lineHeight: "1.55",
            color: emailColors.tintaSuave,
          }}
        >
          <b style={emailStyles.strong}>Para mirar de cerca:</b> {attention}
        </Text>
        <EmailButton href={reportUrl}>Ver informe completo</EmailButton>
        &nbsp;&nbsp;
        <EmailButton href={pdfUrl} variant="outline">
          Descargar PDF
        </EmailButton>
      </Section>
    </EmailLayout>
  );
}

ReportEmail.PreviewProps = {
  churchName: "Iglesia El Ancla",
  recipientName: "María",
  recipientEmail: "maria@elancla.org",
  periodLabel: "Octubre 2026",
  kpis: [
    { label: "Saldo", value: "$ 128.450", delta: "8,4 %", trend: "up" },
    { label: "Ingresos", value: "$ 24.300", delta: "12,1 %", trend: "up" },
    { label: "Egresos", value: "$ 17.920", delta: "6,3 %", trend: "down" },
  ],
  weeklyOfferings: [43, 53, 72, 58, 82],
  highlights: [
    { title: "Ofrenda de misiones", amount: "+ $U 58.200", positive: true },
    { title: "Alquiler de sonido", amount: "− $ 320", positive: false },
    { title: "Diezmos y ofrendas", amount: "+ $ 1.840", positive: true },
  ],
  ministries: [
    { name: "Alabanza", percent: 86 },
    { name: "Jóvenes", percent: 64 },
    { name: "Misiones", percent: 52 },
    { name: "Mantenimiento", percent: 103 },
  ],
  attention: "Mantenimiento superó su presupuesto en 3 %. Alabanza está cerca del límite.",
  reportUrl: "https://app.iekklesia.com/informes/2026-10",
  pdfUrl: "https://app.iekklesia.com/informes/2026-10.pdf",
} satisfies ReportEmailProps;
