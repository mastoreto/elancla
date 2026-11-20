"use client";

import type { SiteSettingsDto } from "@ancla/contracts";
import { useState } from "react";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { BoardInput } from "@/components/dashboard/board/board-form";
import { cn } from "@/lib/utils";
import { useSaveSiteSettings } from "../../hooks/useSaveSiteSettings";
import { toNullableText } from "../../utils/toNullableText";
import { CardSaveFooter } from "../card-save-footer";

const generalInfoCardWebsitePage = {
  grid: cn("grid gap-3.5 md:grid-cols-2"),
};

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
const FOUNDED_PATTERN = /^\d{4}$/;

type GeneralInfoSettings = Pick<
  SiteSettingsDto,
  "name" | "shortName" | "subtitle" | "url" | "contactEmail" | "founded" | "themeColor" | "version"
>;

interface GeneralInfoCardProps {
  settings: GeneralInfoSettings;
}

export function GeneralInfoCard({ settings }: GeneralInfoCardProps) {
  const [name, setName] = useState(settings.name);
  const [shortName, setShortName] = useState(settings.shortName ?? "");
  const [subtitle, setSubtitle] = useState(settings.subtitle ?? "");
  const [url, setUrl] = useState(settings.url);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail ?? "");
  const [founded, setFounded] = useState(settings.founded ?? "");
  const [themeColor, setThemeColor] = useState(settings.themeColor ?? "");
  const { canEdit, saving, save } = useSaveSiteSettings(settings.version);

  const foundedError =
    founded.trim() !== "" && !FOUNDED_PATTERN.test(founded.trim())
      ? "Usa cuatro dígitos."
      : undefined;
  const colorError =
    themeColor.trim() !== "" && !HEX_COLOR_PATTERN.test(themeColor.trim())
      ? "Usa el formato #RRGGBB."
      : undefined;
  const invalid = name.trim() === "" || url.trim() === "" || !!foundedError || !!colorError;

  const submit = () =>
    save(
      {
        name: name.trim(),
        shortName: toNullableText(shortName),
        subtitle: toNullableText(subtitle),
        url: url.trim(),
        contactEmail: toNullableText(contactEmail),
        founded: toNullableText(founded),
        themeColor: toNullableText(themeColor),
      },
      "Datos generales actualizados",
    );

  return (
    <BoardCard>
      <BoardCardHeader
        subtitle="Nombre, contacto y color con los que se presenta el sitio"
        title="Datos generales"
      />
      <div className={generalInfoCardWebsitePage.grid}>
        <BoardInput
          disabled={!canEdit}
          id="site-name"
          label="Nombre"
          maxLength={120}
          onChange={(event) => setName(event.target.value)}
          value={name}
        />
        <BoardInput
          disabled={!canEdit}
          id="site-short-name"
          label="Nombre corto"
          maxLength={120}
          onChange={(event) => setShortName(event.target.value)}
          value={shortName}
        />
        <BoardInput
          disabled={!canEdit}
          id="site-subtitle"
          label="Subtítulo"
          maxLength={200}
          onChange={(event) => setSubtitle(event.target.value)}
          value={subtitle}
        />
        <BoardInput
          disabled={!canEdit}
          id="site-url"
          label="URL del sitio"
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://miiglesia.org"
          type="url"
          value={url}
        />
        <BoardInput
          disabled={!canEdit}
          id="site-contact-email"
          label="Correo de contacto"
          onChange={(event) => setContactEmail(event.target.value)}
          type="email"
          value={contactEmail}
        />
        <BoardInput
          disabled={!canEdit}
          error={foundedError}
          id="site-founded"
          inputMode="numeric"
          label="Año de fundación"
          maxLength={4}
          onChange={(event) => setFounded(event.target.value)}
          value={founded}
        />
        <BoardInput
          disabled={!canEdit}
          error={colorError}
          id="site-theme-color"
          label="Color del sitio"
          onChange={(event) => setThemeColor(event.target.value)}
          placeholder="#2A151A"
          value={themeColor}
        />
      </div>
      <CardSaveFooter
        canEdit={canEdit}
        disabled={invalid}
        onSave={() => void submit()}
        saving={saving}
      />
    </BoardCard>
  );
}
