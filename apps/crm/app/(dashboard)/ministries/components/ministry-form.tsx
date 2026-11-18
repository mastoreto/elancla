"use client";

import { Check, ImageIcon, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import {
  BoardFormCard,
  BoardFormDivider,
  BoardFormFooter,
  BoardFormRow,
  BoardFormSection,
  BoardFormSections,
  BoardInput,
  BoardSelect,
  BoardSwitchRow,
  BoardTextarea,
} from "@/components/dashboard/board/board-form";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { ministries } from "../data/ministries";
import { ministryDetailOverrides } from "../data/ministry-details";
import { type MinistryFormErrors, ministryFormSchema } from "../schema";
import type { MinistryCategory, MinistryFormValues } from "../types";
import { MinistryDeleteDialog } from "./ministry-delete-dialog";

const CATEGORIES: MinistryCategory[] = ["Por edades", "Cultos y Palabra", "Servicio"];
const CATEGORY_OPTIONS = CATEGORIES.map((category) => ({ value: category, label: category }));
const CURRENCY_OPTIONS = [
  { value: "$U", label: "UYU · $U" },
  { value: "$", label: "USD · dólar" },
];

export const EMPTY_MINISTRY_FORM: MinistryFormValues = {
  name: "",
  description: "",
  category: "",
  ages: "",
  howToJoin: "",
  leaderName: "",
  coLeaderName: "",
  schedule: "",
  location: "",
  budget: "",
  currency: "$U",
  visibleOnSite: true,
};

interface MinistryFormProps {
  mode: "create" | "edit";
  initialValues?: MinistryFormValues;
}

/** Leader pickers list the known people, keeping the stored name selectable on edit. */
function buildPeopleOptions(...selected: string[]) {
  const names = new Set([
    ...ministries.map((ministry) => ministry.leaderName),
    ...Object.values(ministryDetailOverrides).flatMap((detail) =>
      detail.coLeaderName ? [detail.coLeaderName] : [],
    ),
  ]);
  for (const name of selected) {
    if (name) {
      names.add(name);
    }
  }
  return [...names].map((name) => ({ value: name, label: name }));
}

const ministryFormMinistriesPage = {
  coverRow: cn("flex items-center gap-[18px]"),
  coverBox: cn(
    "flex h-[104px] w-[130px] shrink-0 items-center justify-center rounded-[22px] border-2 border-dashed border-[var(--oro)] bg-[var(--oro-50)]",
  ),
  coverBubble: cn("size-11"),
  coverText: cn("flex flex-col gap-1.5"),
  coverTitle: cn("text-sm font-semibold"),
  coverHint: cn("text-[13px] leading-normal text-[var(--tinta-suave)]"),
  glyph: cn("size-4"),
  deleteSlot: cn("mr-auto"),
};

export function MinistryForm({ mode, initialValues = EMPTY_MINISTRY_FORM }: MinistryFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<MinistryFormValues>(initialValues);
  const [errors, setErrors] = useState<MinistryFormErrors>({});
  const isEdit = mode === "edit";
  const peopleOptions = buildPeopleOptions(initialValues.leaderName, initialValues.coLeaderName);

  const update = <K extends keyof MinistryFormValues>(field: K, value: MinistryFormValues[K]) =>
    setValues((previous) => ({ ...previous, [field]: value }));

  const goToList = () => router.push(getChurchRoutePath("ministries"));

  // Seed-data screen: validating and going back to the list stands in for the real save.
  const submit = () => {
    const result = ministryFormSchema.safeParse(values);
    if (!result.success) {
      const next: MinistryFormErrors = {};
      for (const issue of result.error.issues) {
        next[issue.path[0] as keyof MinistryFormErrors] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    goToList();
  };

  return (
    <form
      noValidate={true}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <BoardFormCard
        subtitle="Contenido para el sitio web, liderazgo y presupuesto"
        title={isEdit ? "Editar ministerio" : "Nuevo ministerio"}
      >
        <BoardFormSections>
          <BoardFormSection>
            <BoardInput
              error={errors.name}
              id="ministry-name"
              label="Nombre del ministerio *"
              onChange={(event) => update("name", event.target.value)}
              placeholder="Ej. Ministerio de Niños"
              value={values.name}
            />
            <BoardTextarea
              error={errors.description}
              hint="Se muestra en la lista y en el sitio web."
              id="ministry-description"
              label="Descripción *"
              onChange={(event) => update("description", event.target.value)}
              placeholder="Qué hace este ministerio y a quién sirve"
              value={values.description}
            />
            <BoardFormRow>
              <BoardSelect
                error={errors.category}
                id="ministry-category"
                label="Categoría en el sitio *"
                onValueChange={(value) => update("category", value as MinistryCategory)}
                options={CATEGORY_OPTIONS}
                placeholder="Elegir grupo"
                value={values.category}
              />
              <BoardInput
                id="ministry-ages"
                label="Edades o a quién sirve"
                onChange={(event) => update("ages", event.target.value)}
                placeholder="Opcional"
                value={values.ages}
              />
            </BoardFormRow>
            <BoardInput
              id="ministry-join"
              label="Cómo sumarse"
              onChange={(event) => update("howToJoin", event.target.value)}
              placeholder="Qué debe hacer alguien para unirse"
              value={values.howToJoin}
            />
          </BoardFormSection>

          <BoardFormDivider />

          <BoardFormSection>
            <div className={ministryFormMinistriesPage.coverRow}>
              <div className={ministryFormMinistriesPage.coverBox}>
                <IconBubble className={ministryFormMinistriesPage.coverBubble} tone="gold">
                  <ImageIcon aria-hidden="true" className={ministryFormMinistriesPage.glyph} />
                </IconBubble>
              </div>
              <div className={ministryFormMinistriesPage.coverText}>
                <b className={ministryFormMinistriesPage.coverTitle}>Foto de portada</b>
                <span className={ministryFormMinistriesPage.coverHint}>
                  Se muestra en la tarjeta del sitio web. JPG o PNG, horizontal.
                </span>
                <div>
                  <BoardButton size="sm" variant="soft">
                    <Upload aria-hidden="true" className={ministryFormMinistriesPage.glyph} />
                    Subir foto
                  </BoardButton>
                </div>
              </div>
            </div>
          </BoardFormSection>

          <BoardFormDivider />

          <BoardFormSection>
            <BoardFormRow>
              <BoardSelect
                error={errors.leaderName}
                id="ministry-leader"
                label="Líder *"
                onValueChange={(value) => update("leaderName", value)}
                options={peopleOptions}
                placeholder="Elegir persona"
                value={values.leaderName}
              />
              <BoardSelect
                id="ministry-coleader"
                label="Co-líder"
                onValueChange={(value) => update("coLeaderName", value)}
                options={peopleOptions}
                placeholder="Opcional"
                value={values.coLeaderName}
              />
              <BoardInput
                id="ministry-schedule"
                label="Reuniones"
                onChange={(event) => update("schedule", event.target.value)}
                placeholder="Día y hora"
                value={values.schedule}
              />
              <BoardInput
                id="ministry-location"
                label="Lugar"
                onChange={(event) => update("location", event.target.value)}
                placeholder="Dónde se reúnen"
                value={values.location}
              />
            </BoardFormRow>
          </BoardFormSection>

          <BoardFormDivider />

          <BoardFormSection>
            <BoardFormRow>
              <BoardInput
                error={errors.budget}
                id="ministry-budget"
                label="Presupuesto anual"
                min={0}
                onChange={(event) => update("budget", event.target.value)}
                placeholder="0"
                type="number"
                value={values.budget}
              />
              <BoardSelect
                id="ministry-currency"
                label="Moneda"
                onValueChange={(value) =>
                  update("currency", value as MinistryFormValues["currency"])
                }
                options={CURRENCY_OPTIONS}
                value={values.currency}
              />
            </BoardFormRow>
            <BoardSwitchRow
              checked={values.visibleOnSite}
              hint="Aparece en la página pública de ministerios."
              onCheckedChange={(checked) => update("visibleOnSite", checked)}
              title="Mostrar en el sitio web"
            />
          </BoardFormSection>
        </BoardFormSections>

        <BoardFormFooter>
          {isEdit ? (
            <div className={ministryFormMinistriesPage.deleteSlot}>
              <MinistryDeleteDialog
                ministryName={values.name}
                trigger={
                  <BoardButton variant="soft">
                    <Trash2 aria-hidden="true" className={ministryFormMinistriesPage.glyph} />
                    Eliminar ministerio
                  </BoardButton>
                }
              />
            </div>
          ) : null}
          <BoardButton onClick={goToList} variant="ghost">
            Cancelar
          </BoardButton>
          <BoardButton type="submit" variant="primary">
            <Check aria-hidden="true" className={ministryFormMinistriesPage.glyph} />
            {isEdit ? "Guardar cambios" : "Crear ministerio"}
          </BoardButton>
        </BoardFormFooter>
      </BoardFormCard>
    </form>
  );
}
