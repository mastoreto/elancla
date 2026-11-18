"use server";

import { db } from "@ancla/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Valores mínimos requeridos al crear el singleton de configuración.
const DEFAULTS = {
  id: "singleton",
  name: "Iglesia Bautista El Ancla",
  url: "https://elancla.uy",
} as const;

/** Garantiza que exista el registro singleton de SiteSettings. */
async function ensureSettings() {
  return db.siteSettings.upsert({
    where: { id: DEFAULTS.id },
    create: { ...DEFAULTS },
    update: {},
  });
}

// ─── Estado del sitio ────────────────────────────────────────────────────────

const statusSchema = z.enum(["online", "maintenance", "closed"]);
const STATUS_TO_ENUM = {
  online: "ONLINE",
  maintenance: "MAINTENANCE",
  closed: "CLOSED",
} as const;

export async function updateSiteStatus(input: unknown) {
  const status = statusSchema.parse(input);
  await ensureSettings();
  await db.siteSettings.update({
    where: { id: DEFAULTS.id },
    data: { status: STATUS_TO_ENUM[status] },
  });
  revalidatePath("/website");
}

// ─── Redes sociales ──────────────────────────────────────────────────────────

const urlOrEmpty = z.union([z.url(), z.literal("")]);
const socialSchema = z.object({
  website: urlOrEmpty,
  instagram: urlOrEmpty,
  youtube: urlOrEmpty,
  facebook: urlOrEmpty,
  twitter: urlOrEmpty,
  spotify: urlOrEmpty,
  linkedin: urlOrEmpty,
});

export async function updateSocialLinks(input: unknown) {
  const links = socialSchema.parse(input);
  // Cadena vacía → null en la BD.
  const data = Object.fromEntries(Object.entries(links).map(([k, v]) => [k, v === "" ? null : v]));
  await ensureSettings();
  await db.siteSettings.update({ where: { id: DEFAULTS.id }, data });
  revalidatePath("/website");
}

// ─── Sección «Sobre nosotros» (ES en esta iteración) ─────────────────────────

export async function updateAbout(input: unknown) {
  // RichTextEditor produce HTML (string); se guarda en el campo Json como string.
  const aboutRichText = z.string().parse(input);
  const settings = await ensureSettings();
  await db.siteSettingsTranslation.upsert({
    where: { settingsId_locale: { settingsId: settings.id, locale: "ES" } },
    create: { settingsId: settings.id, locale: "ES", aboutRichText },
    update: { aboutRichText },
  });
  revalidatePath("/website");
}
