"use client";

import type { SiteSettingsDto } from "@ancla/contracts";
import { useState } from "react";
import { toast } from "sonner";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { BoardInput } from "@/components/dashboard/board/board-form";
import { cn } from "@/lib/utils";
import { useSaveSiteSettings } from "../../hooks/useSaveSiteSettings";
import { parseOptionalNumber } from "../../utils/parseOptionalNumber";
import { toNullableText } from "../../utils/toNullableText";
import { CardSaveFooter } from "../card-save-footer";

const addressCardWebsitePage = {
  grid: cn("grid gap-3.5 md:grid-cols-2"),
};

const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;

type AddressSettings = Pick<
  SiteSettingsDto,
  | "addressStreet"
  | "addressCity"
  | "addressRegion"
  | "addressCountry"
  | "addressPostal"
  | "geoLat"
  | "geoLng"
  | "version"
>;

interface AddressCardProps {
  settings: AddressSettings;
}

function coordinateError(text: string, limit: number): string | undefined {
  const parsed = parseOptionalNumber(text);
  if (!parsed.valid) return "Escribe un número.";
  if (parsed.value !== null && Math.abs(parsed.value) > limit) return `Entre -${limit} y ${limit}.`;
  return undefined;
}

export function AddressCard({ settings }: AddressCardProps) {
  const [street, setStreet] = useState(settings.addressStreet ?? "");
  const [city, setCity] = useState(settings.addressCity ?? "");
  const [region, setRegion] = useState(settings.addressRegion ?? "");
  const [country, setCountry] = useState(settings.addressCountry ?? "");
  const [postal, setPostal] = useState(settings.addressPostal ?? "");
  const [lat, setLat] = useState(settings.geoLat?.toString() ?? "");
  const [lng, setLng] = useState(settings.geoLng?.toString() ?? "");
  const { canEdit, saving, save } = useSaveSiteSettings(settings.version);

  const latError = coordinateError(lat, MAX_LATITUDE);
  const lngError = coordinateError(lng, MAX_LONGITUDE);

  async function submit(): Promise<void> {
    const geoLat = parseOptionalNumber(lat);
    const geoLng = parseOptionalNumber(lng);
    if (!(geoLat.valid && geoLng.valid)) {
      toast.error("Revisa la latitud y la longitud.");
      return;
    }
    await save(
      {
        addressStreet: toNullableText(street),
        addressCity: toNullableText(city),
        addressRegion: toNullableText(region),
        addressCountry: toNullableText(country),
        addressPostal: toNullableText(postal),
        geoLat: geoLat.value,
        geoLng: geoLng.value,
      },
      "Dirección actualizada",
    );
  }

  return (
    <BoardCard>
      <BoardCardHeader
        subtitle="Donde se encuentra la iglesia: se usa en el sitio y en los buscadores"
        title="Dirección y ubicación"
      />
      <div className={addressCardWebsitePage.grid}>
        <BoardInput
          disabled={!canEdit}
          id="site-street"
          label="Calle y número"
          onChange={(event) => setStreet(event.target.value)}
          value={street}
        />
        <BoardInput
          disabled={!canEdit}
          id="site-city"
          label="Ciudad"
          onChange={(event) => setCity(event.target.value)}
          value={city}
        />
        <BoardInput
          disabled={!canEdit}
          id="site-region"
          label="Región o departamento"
          onChange={(event) => setRegion(event.target.value)}
          value={region}
        />
        <BoardInput
          disabled={!canEdit}
          id="site-country"
          label="País"
          onChange={(event) => setCountry(event.target.value)}
          value={country}
        />
        <BoardInput
          disabled={!canEdit}
          id="site-postal"
          label="Código postal"
          maxLength={40}
          onChange={(event) => setPostal(event.target.value)}
          value={postal}
        />
        <span />
        <BoardInput
          disabled={!canEdit}
          error={latError}
          id="site-lat"
          inputMode="decimal"
          label="Latitud"
          onChange={(event) => setLat(event.target.value)}
          value={lat}
        />
        <BoardInput
          disabled={!canEdit}
          error={lngError}
          id="site-lng"
          inputMode="decimal"
          label="Longitud"
          onChange={(event) => setLng(event.target.value)}
          value={lng}
        />
      </div>
      <CardSaveFooter
        canEdit={canEdit}
        disabled={!!latError || !!lngError}
        onSave={() => void submit()}
        saving={saving}
      />
    </BoardCard>
  );
}
