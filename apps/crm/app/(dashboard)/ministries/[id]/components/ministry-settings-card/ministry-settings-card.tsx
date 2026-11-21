"use client";

import {
  MINISTRY_COLORS,
  MINISTRY_DESTINATIONS,
  MINISTRY_EXTERNAL_URL_MAX_LENGTH,
  MINISTRY_ICONS,
  type MinistryCategoryDto,
  type MinistryColor,
  type MinistryDestination,
  type MinistryIcon,
  type MinistryListItemDto,
} from "@ancla/contracts";
import { useState } from "react";
import { toast } from "sonner";
import { BoardButton } from "@/components/dashboard/board/board-button";
import {
  BoardFormCard,
  BoardFormFooter,
  BoardFormRow,
  BoardFormSection,
  BoardFormSections,
  BoardInput,
  BoardSelect,
} from "@/components/dashboard/board/board-form";
import { apiClient } from "@/lib/api/apiClient";
import { COLOR_LABELS, DESTINATION_LABELS, ICON_LABELS } from "../../../data/ministryLabels";
import { useMinistryRequest } from "../../../hooks/useMinistryRequest";
import { pickLocalized } from "../../../utils/pickLocalized";
import type { MinistrySettingsValues } from "../../types";
import {
  toMinistrySettingsBody,
  toMinistrySettingsValues,
  validateMinistrySettings,
} from "../../utils/ministrySettingsValues";

/** A select cannot hold an empty value, so "none" travels as this one. */
const NONE = "none";

const DESTINATION_OPTIONS = MINISTRY_DESTINATIONS.map((value) => ({
  value,
  label: DESTINATION_LABELS[value],
}));
const ICON_OPTIONS = [
  { value: NONE, label: "Sin ícono" },
  ...MINISTRY_ICONS.map((value) => ({ value, label: ICON_LABELS[value] })),
];
const COLOR_OPTIONS = MINISTRY_COLORS.map((value) => ({ value, label: COLOR_LABELS[value] }));

interface MinistrySettingsCardProps {
  ministry: MinistryListItemDto;
  categories: readonly MinistryCategoryDto[];
  defaultLocale: string;
}

/** Category, destination, icon and color: saved directly (not editorial), with the version read. */
export function MinistrySettingsCard({
  ministry,
  categories,
  defaultLocale,
}: MinistrySettingsCardProps) {
  const [values, setValues] = useState<MinistrySettingsValues>(() =>
    toMinistrySettingsValues(ministry),
  );
  const [showErrors, setShowErrors] = useState(false);
  const { busy, run } = useMinistryRequest();
  const errors = validateMinistrySettings(values);
  const update = (patch: Partial<MinistrySettingsValues>) =>
    setValues((previous) => ({ ...previous, ...patch }));

  const categoryOptions = [
    { value: NONE, label: "Sin categoría" },
    ...categories.map((category) => ({
      value: category.id,
      label: pickLocalized(category.translations, defaultLocale),
    })),
  ];

  async function submit(): Promise<void> {
    if (errors.externalUrl) {
      setShowErrors(true);
      toast.error("Revisa los campos marcados.");
      return;
    }
    await run(
      () =>
        apiClient.content.ministries[":id"].settings.$patch({
          param: { id: ministry.id },
          json: toMinistrySettingsBody(values, ministry.version),
        }),
      "Configuración guardada",
    );
  }

  return (
    <BoardFormCard
      subtitle="Cómo se clasifica el ministerio y a dónde lleva en el sitio. Se guarda al instante, sin revisión."
      title="Configuración"
    >
      <BoardFormSections>
        <BoardFormSection>
          <BoardFormRow>
            <BoardSelect
              id="ministry-category"
              label="Categoría"
              onValueChange={(categoryId) =>
                update({ categoryId: categoryId === NONE ? "" : categoryId })
              }
              options={categoryOptions}
              value={values.categoryId === "" ? NONE : values.categoryId}
            />
            <BoardSelect
              id="ministry-destination"
              label="Destino"
              onValueChange={(destination) =>
                update({ destination: destination as MinistryDestination })
              }
              options={DESTINATION_OPTIONS}
              value={values.destination}
            />
          </BoardFormRow>
          {values.destination === "external" ? (
            <BoardInput
              data-testid="ministry-external-url"
              error={showErrors ? errors.externalUrl : undefined}
              id="ministry-external-url"
              label="Dirección externa"
              maxLength={MINISTRY_EXTERNAL_URL_MAX_LENGTH}
              onChange={(event) => update({ externalUrl: event.target.value })}
              placeholder="https://"
              value={values.externalUrl}
            />
          ) : null}
          <BoardFormRow>
            <BoardSelect
              id="ministry-icon"
              label="Ícono"
              onValueChange={(icon) =>
                update({ icon: icon === NONE ? "" : (icon as MinistryIcon) })
              }
              options={ICON_OPTIONS}
              value={values.icon === "" ? NONE : values.icon}
            />
            <BoardSelect
              id="ministry-color"
              label="Color"
              onValueChange={(color) => update({ color: color as MinistryColor })}
              options={COLOR_OPTIONS}
              value={values.color}
            />
          </BoardFormRow>
        </BoardFormSection>
      </BoardFormSections>
      <BoardFormFooter>
        <BoardButton
          data-testid="ministry-settings-save"
          disabled={busy}
          onClick={() => void submit()}
          variant="primary"
        >
          {busy ? "Guardando…" : "Guardar configuración"}
        </BoardButton>
      </BoardFormFooter>
    </BoardFormCard>
  );
}
