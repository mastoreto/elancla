"use server";

import { db } from "@ancla/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "./lib/requireAdminSession";

const DEFAULT_LOCALE = "es";

/**
 * Site settings of the organization; the seed creates them.
 * ponytail: single organization today; the API (phase 1.3) resolves it from the session tenant.
 */
async function getSettings() {
  return db.siteSettings.findFirstOrThrow();
}

// ─── Estado del sitio ────────────────────────────────────────────────────────

const statusSchema = z.enum(["online", "maintenance", "closed"]);
const STATUS_TO_ENUM = {
  online: "ONLINE",
  maintenance: "MAINTENANCE",
  closed: "CLOSED",
} as const;

export async function updateSiteStatus(input: unknown) {
  await requireAdminSession();
  const status = statusSchema.parse(input);
  const settings = await getSettings();
  await db.siteSettings.update({
    where: { id: settings.id },
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
  await requireAdminSession();
  const links = socialSchema.parse(input);
  // Cadena vacía → null en la BD.
  const data = Object.fromEntries(Object.entries(links).map(([k, v]) => [k, v === "" ? null : v]));
  const settings = await getSettings();
  await db.siteSettings.update({ where: { id: settings.id }, data });
  revalidatePath("/website");
}

// ─── Sección «Sobre nosotros» (ES en esta iteración) ─────────────────────────

export async function updateAbout(input: unknown) {
  await requireAdminSession();
  // RichTextEditor produce HTML (string); se guarda en el campo Json como string.
  const aboutRichText = z.string().parse(input);
  const settings = await getSettings();
  await db.siteSettingsTranslation.upsert({
    where: { siteSettingsId_locale: { siteSettingsId: settings.id, locale: DEFAULT_LOCALE } },
    create: { siteSettingsId: settings.id, locale: DEFAULT_LOCALE, aboutRichText },
    update: { aboutRichText },
  });
  revalidatePath("/website");
}
