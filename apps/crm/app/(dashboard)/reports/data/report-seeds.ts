import type {
  GeneratedReportListItem,
  ReportDetailViewData,
  ReportKind,
  ReportTemplateItem,
} from "../types";

export const reportTemplates: ReportTemplateItem[] = [
  {
    kind: "SUMMARY",
    name: "Resumen general",
    description: "Tarjetas con ingresos, egresos, balance y cantidad de movimientos.",
    hint: "Cifras clave y balance",
  },
  {
    kind: "COMPARISON",
    name: "Ingresos vs egresos",
    description: "Comparación mensual con gráfica de barras.",
    hint: "Comparación mensual",
  },
  {
    kind: "DISTRIBUTION",
    name: "Distribución por ministerio",
    description: "Porcentaje de gasto por ministerio con gráfica de dona.",
    hint: "Distribución porcentual",
  },
];

export const generatedReports: GeneratedReportListItem[] = [
  {
    id: "resumen-general-octubre-2026",
    name: "Resumen general · octubre 2026",
    subtitle: "Ejecutivo · 1 – 31 oct",
    kind: "SUMMARY",
    status: "READY",
    format: "PDF_CSV",
    generatedLabel: "Generado hoy 09:12",
  },
  {
    id: "ingresos-egresos-tercer-trimestre",
    name: "Ingresos vs egresos · tercer trimestre",
    subtitle: "Comparativo · jul – sep",
    kind: "COMPARISON",
    status: "READY",
    format: "PDF",
    generatedLabel: "Generado 3 nov",
  },
  {
    id: "distribucion-ministerio-2026",
    name: "Distribución por ministerio · 2026",
    subtitle: "Distribución · ene – oct",
    kind: "SUMMARY",
    status: "PROCESSING",
    format: "PDF_CSV",
    generatedLabel: "Generando…",
  },
  {
    id: "movimientos-misiones",
    name: "Movimientos de misiones",
    subtitle: "Detalle · 2026",
    kind: "DETAIL",
    status: "READY",
    format: "CSV",
    generatedLabel: "Generado 28 oct",
  },
];

export const FORMAT_LABELS = {
  PDF: "PDF",
  CSV: "CSV",
  PDF_CSV: "PDF y CSV",
} as const;

export const reportKindLabels = {
  SUMMARY: "Resumen",
  COMPARISON: "Comparativo",
  DISTRIBUTION: "Distribución",
  DETAIL: "Detalle",
} as const satisfies Record<ReportKind, string>;

const sampleDetail: Omit<ReportDetailViewData, "report"> = {
  generatedBy: "María García",
  kpis: [
    { label: "Ingresos", value: "$U 170 mil", detail: "Egresos registrados en el período" },
    { label: "Egresos", value: "$U 46 mil", detail: "Registros incluidos" },
    { label: "Balance", value: "$U 124 mil", detail: "+ USD 1.350 en dólares" },
    { label: "Movimientos", value: "48", detail: "Del 1 al 30 de noviembre" },
  ],
  months: [
    { month: "Jun", income: 118, expense: 62 },
    { month: "Jul", income: 132, expense: 71 },
    { month: "Ago", income: 126, expense: 58 },
    { month: "Sep", income: 149, expense: 80 },
    { month: "Oct", income: 158, expense: 66 },
    { month: "Nov", income: 170, expense: 46 },
  ],
  shares: [
    { label: "Alabanza", percent: 34 },
    { label: "Jóvenes", percent: 26 },
    { label: "Misiones", percent: 21 },
    { label: "Mantenimiento", percent: 12 },
    { label: "Otros", percent: 7 },
  ],
  movementTotal: 48,
  movements: [
    {
      id: "m1",
      dateLabel: "22 mar",
      concept: "Ofrenda dominical",
      note: "Culto de adoración",
      type: "INCOME",
      project: "—",
      amountLabel: "+ $U 45.000",
    },
    {
      id: "m2",
      dateLabel: "21 mar",
      concept: "Factura de luz",
      note: "UTE · marzo",
      type: "EXPENSE",
      project: "—",
      amountLabel: "− $U 8.500",
    },
    {
      id: "m3",
      dateLabel: "20 mar",
      concept: "Donación campamento",
      note: "Aporte de familia",
      type: "INCOME",
      project: "Jóvenes",
      amountLabel: "+ $ 500",
    },
    {
      id: "m4",
      dateLabel: "19 mar",
      concept: "Equipo de sonido",
      note: "Cables y micrófonos",
      type: "EXPENSE",
      project: "Adoración",
      amountLabel: "− $ 350",
    },
    {
      id: "m5",
      dateLabel: "18 mar",
      concept: "Diezmos",
      note: "Semana 3",
      type: "INCOME",
      project: "—",
      amountLabel: "+ $U 125.000",
    },
  ],
};

/** Every generated report shares the board's sample figures until real data exists. */
export function getReportDetail(reportId: string): ReportDetailViewData | null {
  const report = generatedReports.find((item) => item.id === reportId);
  return report ? { report, ...sampleDetail } : null;
}
