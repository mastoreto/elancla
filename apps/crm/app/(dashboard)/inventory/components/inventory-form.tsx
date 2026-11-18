"use client";

import {
  CalendarDays,
  Check,
  DollarSign,
  ImageIcon,
  MapPin,
  Tag,
  Trash2,
  Upload,
} from "lucide-react";
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
  boardFormStyles,
} from "@/components/dashboard/board/board-form";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { inventoryDetailOverrides } from "../data/inventory-details";
import { inventoryItems } from "../data/inventory-items";
import {
  INVENTORY_CATEGORIES,
  INVENTORY_STATUSES,
  type InventoryFormErrors,
  inventoryFormSchema,
} from "../schema";
import type { InventoryFormValues } from "../types";
import { InventoryDeleteDialog } from "./inventory-delete-dialog";

export const EMPTY_INVENTORY_FORM: InventoryFormValues = {
  name: "",
  category: "",
  location: "",
  quantity: "1",
  status: "Bueno",
  brandModel: "",
  serialNumber: "",
  responsible: "",
  acquiredOn: "",
  acquisitionMode: "Compra",
  supplier: "",
  purchaseCurrency: "UYU",
  purchaseValue: "",
  value: "",
  notes: "",
  needsMaintenance: false,
};

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

const CATEGORY_OPTIONS = toOptions(INVENTORY_CATEGORIES);
const STATUS_OPTIONS = toOptions(INVENTORY_STATUSES);
const LOCATION_OPTIONS = toOptions([...new Set(inventoryItems.map((item) => item.location))]);
const RESPONSIBLE_OPTIONS = toOptions([
  ...new Set(
    Object.values(inventoryDetailOverrides).flatMap((detail) =>
      detail.responsible ? [detail.responsible] : [],
    ),
  ),
]);
const CURRENCY_OPTIONS = [
  { value: "UYU", label: "UYU · $U" },
  { value: "USD", label: "USD · dólar" },
];

interface InventoryFormProps {
  mode: "create" | "edit";
  initialValues?: InventoryFormValues;
  /** Shown in the edit form so the delete dialog can name the item. */
  itemCode?: string;
}

const inventoryFormInventoryPage = {
  form: cn("flex flex-col"),
  sections: cn("flex flex-col gap-[22px]"),
  photoRow: cn("flex items-center gap-[18px]"),
  photoBox: cn(
    "flex h-[104px] w-[130px] shrink-0 items-center justify-center rounded-[22px] border-2 border-dashed border-[var(--oro)] bg-[var(--oro-50)]",
  ),
  photoBubble: cn("size-11"),
  photoText: cn("flex flex-col gap-1.5"),
  photoTitle: cn("text-sm font-semibold"),
  photoHint: cn("text-[13px] leading-normal text-[var(--tinta-suave)]"),
  glyph: cn("size-4"),
  fieldIcon: cn(boardFormStyles.icon),
  deleteSlot: cn("mr-auto"),
};

export function InventoryForm({
  mode,
  initialValues = EMPTY_INVENTORY_FORM,
  itemCode,
}: InventoryFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<InventoryFormValues>(initialValues);
  const [errors, setErrors] = useState<InventoryFormErrors>({});
  const isEdit = mode === "edit";
  const nextCode = `INV-${String(inventoryItems.length + 1).padStart(4, "0")}`;

  const update = <K extends keyof InventoryFormValues>(field: K, value: InventoryFormValues[K]) =>
    setValues((previous) => ({ ...previous, [field]: value }));

  const goToList = () => router.push(getChurchRoutePath("inventory"));

  // Seed-data screen: validating and returning to the list stands in for the real save.
  const submit = () => {
    const result = inventoryFormSchema.safeParse(values);
    if (!result.success) {
      const next: InventoryFormErrors = {};
      for (const issue of result.error.issues) {
        next[issue.path[0] as keyof InventoryFormErrors] ??= issue.message;
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
        subtitle="Datos básicos, estado, compra y notas"
        title={isEdit ? "Editar ítem" : "Nuevo ítem"}
      >
        <BoardFormSections>
          <BoardFormSection>
            <div className={inventoryFormInventoryPage.photoRow}>
              <div className={inventoryFormInventoryPage.photoBox}>
                <IconBubble className={inventoryFormInventoryPage.photoBubble} tone="gold">
                  <ImageIcon aria-hidden="true" className={inventoryFormInventoryPage.glyph} />
                </IconBubble>
              </div>
              <div className={inventoryFormInventoryPage.photoText}>
                <b className={inventoryFormInventoryPage.photoTitle}>Foto del ítem</b>
                <span className={inventoryFormInventoryPage.photoHint}>
                  JPG o PNG hasta 5 MB. Ayuda a reconocerlo rápido en el depósito.
                </span>
                <div>
                  <BoardButton size="sm" variant="soft">
                    <Upload aria-hidden="true" className={inventoryFormInventoryPage.glyph} />
                    Subir foto
                  </BoardButton>
                </div>
              </div>
            </div>
            <BoardInput
              error={errors.name}
              id="inventory-name"
              label="Nombre del ítem *"
              onChange={(event) => update("name", event.target.value)}
              placeholder="Ej. Consola de sonido"
              value={values.name}
            />
            <BoardFormRow>
              <BoardSelect
                error={errors.category}
                id="inventory-category"
                label="Categoría *"
                onValueChange={(value) =>
                  update("category", value as InventoryFormValues["category"])
                }
                options={CATEGORY_OPTIONS}
                placeholder="Elegir categoría"
                value={values.category}
              />
              <BoardInput
                hint="Se genera solo"
                icon={<Tag aria-hidden="true" className={inventoryFormInventoryPage.fieldIcon} />}
                id="inventory-code"
                label="Código"
                readOnly={true}
                value={itemCode ?? nextCode}
              />
            </BoardFormRow>
          </BoardFormSection>

          <BoardFormDivider />

          <BoardFormSection>
            <BoardFormRow columns={3}>
              <BoardInput
                error={errors.quantity}
                id="inventory-quantity"
                label="Cantidad *"
                min={1}
                onChange={(event) => update("quantity", event.target.value)}
                type="number"
                value={values.quantity}
              />
              <BoardSelect
                id="inventory-status"
                label="Estado *"
                onValueChange={(value) => update("status", value as InventoryFormValues["status"])}
                options={STATUS_OPTIONS}
                value={values.status}
              />
              <BoardSelect
                id="inventory-responsible"
                label="Responsable"
                onValueChange={(value) => update("responsible", value)}
                options={RESPONSIBLE_OPTIONS}
                placeholder="Elegir"
                value={values.responsible}
              />
            </BoardFormRow>
            <BoardSelect
              error={errors.location}
              id="inventory-location"
              label="Ubicación *"
              onValueChange={(value) => update("location", value)}
              options={LOCATION_OPTIONS}
              placeholder="Dónde está guardado"
              value={values.location}
            />
          </BoardFormSection>

          <BoardFormDivider />

          <BoardFormSection>
            <BoardFormRow>
              <BoardInput
                icon={
                  <CalendarDays
                    aria-hidden="true"
                    className={inventoryFormInventoryPage.fieldIcon}
                  />
                }
                id="inventory-acquired"
                label="Fecha de compra"
                onChange={(event) => update("acquiredOn", event.target.value)}
                placeholder="dd/mm/aaaa"
                value={values.acquiredOn}
              />
              <BoardInput
                id="inventory-supplier"
                label="Proveedor"
                onChange={(event) => update("supplier", event.target.value)}
                placeholder="Opcional"
                value={values.supplier}
              />
              <BoardInput
                icon={
                  <DollarSign aria-hidden="true" className={inventoryFormInventoryPage.fieldIcon} />
                }
                id="inventory-purchase-value"
                label="Valor de compra"
                min={0}
                onChange={(event) => update("purchaseValue", event.target.value)}
                placeholder="0"
                type="number"
                value={values.purchaseValue}
              />
              <BoardSelect
                id="inventory-currency"
                label="Moneda"
                onValueChange={(value) =>
                  update("purchaseCurrency", value as InventoryFormValues["purchaseCurrency"])
                }
                options={CURRENCY_OPTIONS}
                value={values.purchaseCurrency}
              />
              <BoardInput
                id="inventory-brand-model"
                label="Marca y modelo"
                onChange={(event) => update("brandModel", event.target.value)}
                placeholder="Opcional"
                value={values.brandModel}
              />
              <BoardInput
                id="inventory-serial"
                label="N.º de serie"
                onChange={(event) => update("serialNumber", event.target.value)}
                placeholder="Opcional"
                value={values.serialNumber}
              />
            </BoardFormRow>
          </BoardFormSection>

          <BoardFormDivider />

          <BoardFormSection>
            <BoardTextarea
              id="inventory-notes"
              label="Notas"
              onChange={(event) => update("notes", event.target.value)}
              placeholder="Detalles, accesorios incluidos, observaciones…"
              value={values.notes}
            />
            <BoardSwitchRow
              checked={values.needsMaintenance}
              hint="Te avisaremos cuando toque revisarlo."
              onCheckedChange={(checked) => update("needsMaintenance", checked)}
              title="Requiere mantenimiento periódico"
            />
          </BoardFormSection>
        </BoardFormSections>

        <BoardFormFooter>
          {isEdit ? (
            <div className={inventoryFormInventoryPage.deleteSlot}>
              <InventoryDeleteDialog
                itemCode={itemCode ?? nextCode}
                itemName={values.name}
                trigger={
                  <BoardButton variant="soft">
                    <Trash2 aria-hidden="true" className={inventoryFormInventoryPage.glyph} />
                    Eliminar ítem
                  </BoardButton>
                }
              />
            </div>
          ) : null}
          <BoardButton onClick={goToList} variant="ghost">
            Cancelar
          </BoardButton>
          <BoardButton type="submit" variant="primary">
            <Check aria-hidden="true" className={inventoryFormInventoryPage.glyph} />
            {isEdit ? "Guardar cambios" : "Guardar ítem"}
          </BoardButton>
        </BoardFormFooter>
      </BoardFormCard>
    </form>
  );
}
