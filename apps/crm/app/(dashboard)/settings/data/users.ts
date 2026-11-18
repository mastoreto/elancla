import type { SettingsUser } from "../types";

// Seed users until the Users API is wired.
export const settingsUsers: SettingsUser[] = [
  {
    id: "user-maria",
    name: "María García",
    email: "maria@elancla.org",
    initials: "MG",
    tone: "gold",
    role: "treasury",
    lastAccess: "hoy 09:12",
  },
  {
    id: "user-daniel",
    name: "Daniel Rivas",
    email: "pastor@elancla.org",
    initials: "DR",
    tone: "rose",
    role: "admin",
    lastAccess: "ayer 18:40",
  },
  {
    id: "user-carlos",
    name: "Carlos Rodríguez",
    email: "carlos@elancla.org",
    initials: "CR",
    tone: "green",
    role: "leader",
    lastAccess: "hace 3 días",
  },
  {
    id: "user-laura",
    name: "Laura González",
    email: "laura@elancla.org",
    initials: "LG",
    tone: "rose",
    role: "reader",
    lastAccess: "hace 1 semana",
  },
];

export const PENDING_INVITATIONS = 1;
