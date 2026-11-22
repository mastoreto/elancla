import type { PermissionAction, PermissionResource, PermissionScope } from "@ancla/contracts";

export const PERMISSION_ACTION_LABELS: Record<PermissionAction, string> = {
  view: "Ver",
  create: "Crear",
  edit: "Editar",
  approve: "Aprobar",
  delete: "Eliminar",
  publish: "Publicar",
};

export const PERMISSION_SCOPE_LABELS: Record<PermissionScope, string> = {
  own: "Propios",
  ministry: "Su ministerio",
  all: "Todos",
};

export const PERMISSION_RESOURCE_INFO: Record<PermissionResource, { label: string; hint: string }> =
  {
    movements: { label: "Movimientos", hint: "Ingresos y egresos" },
    requests: { label: "Solicitudes", hint: "Pedidos de fondos" },
    vouchers: { label: "Boletas y comprobantes", hint: "Respaldo de gastos" },
    projects: { label: "Proyectos", hint: "Iniciativas con presupuesto" },
    budgets: { label: "Presupuestos", hint: "Montos por ministerio" },
    voting: { label: "Votaciones", hint: "Asambleas y quórum" },
    reports: { label: "Informes", hint: "Reportes y exportación" },
    content: { label: "Contenido", hint: "Sitio, blog y podcasts" },
    "content.posts": { label: "Entradas del blog", hint: "Escribir y publicar entradas" },
    site: { label: "Configuración del sitio", hint: "Datos, horarios y secciones del sitio" },
    "content.people": { label: "Personas del sitio", hint: "Equipo y liderazgo que se muestra" },
    "content.visit": { label: "Visítanos", hint: "Indicaciones y preguntas frecuentes" },
    "content.pages": { label: "Páginas del sitio", hint: "Páginas simples como la privacidad" },
    "content.events": {
      label: "Calendario: horarios y eventos",
      hint: "Horarios, lugares, excepciones y eventos",
    },
    "calendar.internal": {
      label: "Calendario: eventos internos",
      hint: "Ver los eventos internos de su audiencia",
    },
    "calendar.year": { label: "Calendario: año", hint: "Publicar el año del calendario" },
    "ministries.profile": { label: "Ministerios: perfil", hint: "Datos públicos del ministerio" },
    "ministries.finance": {
      label: "Ministerios: finanzas",
      hint: "Presupuesto y gastos del ministerio",
    },
    users: { label: "Usuarios", hint: "Personas con acceso" },
    roles: { label: "Roles", hint: "Perfiles y permisos" },
    invitations: { label: "Invitaciones", hint: "Altas por correo" },
    "site.keys": { label: "Claves del sitio", hint: "Acceso del sitio público al contenido" },
    audit: { label: "Auditoría", hint: "Registro de lo que ocurre en el sistema" },
    editorial: { label: "Revisión editorial", hint: "Quién revisa y publica el contenido" },
    settings: { label: "Configuración", hint: "Iglesia, cuentas y monedas" },
  };

/** Maximum session length a role can set; `null` keeps the default (30 days). */
export const SESSION_DURATION_OPTIONS: { value: string; label: string; seconds: number | null }[] =
  [
    { value: "default", label: "Predeterminada (30 días)", seconds: null },
    { value: "1h", label: "1 hora", seconds: 60 * 60 },
    { value: "8h", label: "8 horas", seconds: 8 * 60 * 60 },
    { value: "1d", label: "1 día", seconds: 24 * 60 * 60 },
    { value: "7d", label: "7 días", seconds: 7 * 24 * 60 * 60 },
  ];
