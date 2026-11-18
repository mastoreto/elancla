// Seed figures taken from the "crm-s-resumen" board until the treasury API is wired.
export interface BalanceCard {
  id: string;
  label: string;
  value: string;
  detail: string;
  href: string;
  highlighted?: boolean;
}

export interface RecentMovement {
  id: string;
  concept: string;
  note: string;
  kind: "income" | "expense";
  amount: string;
}

export interface PendingApproval {
  id: string;
  initials: string;
  title: string;
  owner: string;
  amount: string;
  tone: "rose" | "gold" | "green";
}

export interface ProjectBudget {
  id: string;
  name: string;
  spent: string;
  total: string;
  percent: number;
}

export const balanceCards: BalanceCard[] = [
  {
    id: "cash",
    label: "Caja · efectivo",
    value: "$U 185 mil",
    detail: "+ USD 450 disponibles",
    href: "movements",
  },
  {
    id: "bank",
    label: "Banco · cuentas",
    value: "$U 520 mil",
    detail: "+ USD 2.800 en USD",
    href: "movements",
  },
  {
    id: "income",
    label: "Ingresos · mes",
    value: "$U 170 mil",
    detail: "+12 % vs. periodo anterior",
    href: "movements",
  },
  {
    id: "net",
    label: "Flujo neto",
    value: "$U 124 mil",
    detail: "$U 705 mil de saldo total",
    href: "reports",
    highlighted: true,
  },
];

export const recentMovements: RecentMovement[] = [
  {
    id: "1",
    concept: "Ofrenda dominical",
    note: "Culto de adoración",
    kind: "income",
    amount: "+ $U 45.000",
  },
  {
    id: "2",
    concept: "Factura de luz",
    note: "UTE · marzo",
    kind: "expense",
    amount: "− $U 8.500",
  },
  {
    id: "3",
    concept: "Donación campamento",
    note: "Aporte de familia",
    kind: "income",
    amount: "+ $ 500",
  },
  {
    id: "4",
    concept: "Equipo de sonido",
    note: "Cables y micrófonos",
    kind: "expense",
    amount: "− $ 350",
  },
  { id: "5", concept: "Diezmos", note: "Semana 3", kind: "income", amount: "+ $U 125.000" },
  {
    id: "6",
    concept: "Mantenimiento del templo",
    note: "Pintura del frente",
    kind: "expense",
    amount: "− $U 35.000",
  },
];

export const pendingApprovals: PendingApproval[] = [
  {
    id: "1",
    initials: "CR",
    title: "Suministros para campamento",
    owner: "Jóvenes · Carlos Rodríguez",
    amount: "$U 15.000",
    tone: "rose",
  },
  {
    id: "2",
    initials: "RS",
    title: "Visas del viaje misionero",
    owner: "Misiones · Roberto Silva",
    amount: "USD 320",
    tone: "gold",
  },
  {
    id: "3",
    initials: "AM",
    title: "Cuerdas de guitarra",
    owner: "Adoración · Ana Martínez",
    amount: "$U 4.500",
    tone: "green",
  },
];

export const projectBudgets: ProjectBudget[] = [
  { id: "1", name: "Fondo de Construcción", spent: "$U 185.000", total: "$U 500.000", percent: 37 },
  { id: "2", name: "Campamento de Jóvenes", spent: "$U 15.000", total: "$U 75.000", percent: 20 },
  {
    id: "3",
    name: "Materiales escuela dominical",
    spent: "$U 6.500",
    total: "$U 25.000",
    percent: 26,
  },
];

export const treasuryNote =
  "Faltan 3 comprobantes para cerrar noviembre. Alabanza usó el 86 % de su presupuesto anual.";
