// Seed figures taken from the "crm-s-publico-informe" board until the report API is wired.
export interface PublicReportKpi {
  id: string;
  label: string;
  value: string;
  tone: "income" | "expense" | "neutral";
}

export interface PublicReportMonth {
  month: string;
  income: number;
  expense: number;
}

export interface PublicReportMinistry {
  name: string;
  amount: string;
  percent: number;
  color: string;
}

export interface PublicReportMovement {
  id: string;
  label: string;
  date: string;
  amount: string;
  kind: "income" | "expense";
}

export const publicReportPeriod = "Del 1 al 30 de noviembre · generado por Tesorería";

export const publicReportKpis: PublicReportKpi[] = [
  { id: "income", label: "Ingresos", value: "$U 170 mil", tone: "income" },
  { id: "expense", label: "Egresos", value: "$U 46 mil", tone: "expense" },
  { id: "balance", label: "Balance", value: "$U 124 mil", tone: "neutral" },
  { id: "movements", label: "Movimientos", value: "48", tone: "neutral" },
];

// Values are thousands of UYU; the chart scales them to its drawing area.
export const publicReportMonths: PublicReportMonth[] = [
  { month: "Jun", income: 124, expense: 96 },
  { month: "Jul", income: 140, expense: 104 },
  { month: "Ago", income: 116, expense: 120 },
  { month: "Sep", income: 152, expense: 100 },
  { month: "Oct", income: 136, expense: 108 },
  { month: "Nov", income: 168, expense: 92 },
];

export const publicReportMinistries: PublicReportMinistry[] = [
  { name: "Adoración", amount: "$U 52 mil", percent: 34, color: "var(--granada)" },
  { name: "Misiones", amount: "$U 38 mil", percent: 25, color: "var(--oro)" },
  { name: "Jóvenes", amount: "$U 29 mil", percent: 19, color: "var(--vida)" },
  { name: "Mantenimiento", amount: "$U 22 mil", percent: 14, color: "#7a5bb0" },
  { name: "Otros", amount: "$U 12 mil", percent: 8, color: "#b9aab0" },
];

export const publicReportMovements: PublicReportMovement[] = [
  { id: "m1", label: "Ofrenda dominical", date: "22 nov", amount: "+ $U 45.000", kind: "income" },
  { id: "m2", label: "Factura de luz", date: "21 nov", amount: "− $U 8.500", kind: "expense" },
  { id: "m3", label: "Diezmos · semana 3", date: "18 nov", amount: "+ $U 125.000", kind: "income" },
  {
    id: "m4",
    label: "Mantenimiento del templo",
    date: "17 nov",
    amount: "− $U 35.000",
    kind: "expense",
  },
  { id: "m5", label: "Viaje misionero", date: "16 nov", amount: "− USD 1.200", kind: "expense" },
];

export const publicReportMovementsTotal = 48;
