"use client";

import { Upload } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { cn } from "@/lib/utils";
import type {
  Receipt,
  ReceiptFormField,
  ReceiptFormValues,
  ReceiptModalMode,
  ReceiptRelatedOption,
} from "../types";
import { filterReceipts, paginateReceipts, RECEIPTS_PAGE_SIZE } from "../utils";
import { ReceiptDeleteDialog } from "./receipt-delete-dialog";
import { ReceiptDetailPanel } from "./receipt-detail-panel";
import { ReceiptModal } from "./receipt-modal";
import { ReceiptsTable } from "./receipts-table";
import { ReceiptsToolbar } from "./receipts-toolbar";

interface ReceiptsPageContentProps {
  initialReceipts: Receipt[];
  relatedOptions: ReceiptRelatedOption[];
  initialErrorMessage?: string | null;
}

const receiptsPageContentReceiptsPage = {
  page: cn("flex flex-col gap-5"),
  header: cn("flex flex-wrap items-center gap-4"),
  description: cn("min-w-60 flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  actionIcon: cn("size-4"),
  split: cn("grid items-start gap-[18px] xl:grid-cols-[1.6fr_1fr]"),
};

function formatDateInput(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function createDefaultFormValues(): ReceiptFormValues {
  return {
    number: "",
    provider: "",
    amount: "",
    currency: "UYU",
    date: formatDateInput(new Date()),
    relatedEntity: "",
    fileUrl: "",
  };
}

function mapReceiptToFormValues(receipt: Receipt): ReceiptFormValues {
  return {
    number: receipt.number,
    provider: receipt.provider,
    amount: String(receipt.amount),
    currency: receipt.currency,
    date: formatDateInput(receipt.date),
    relatedEntity: receipt.relatedEntity,
    fileUrl: receipt.fileUrl ?? "",
  };
}

function mapFormValuesToReceipt(values: ReceiptFormValues, id: string): Receipt {
  return {
    id,
    number: values.number,
    provider: values.provider,
    amount: Number(values.amount) || 0,
    currency: values.currency ?? "UYU",
    date: values.date ? new Date(`${values.date}T00:00:00`) : new Date(),
    relatedEntity: values.relatedEntity,
    fileUrl: values.fileUrl || undefined,
  };
}

export function ReceiptsPageContent({
  initialReceipts,
  relatedOptions,
  initialErrorMessage = null,
}: ReceiptsPageContentProps) {
  const [receipts, setReceipts] = useState(initialReceipts);
  const [searchQuery, setSearchQuery] = useState("");
  const [currency, setCurrency] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(initialReceipts[0]?.id ?? null);
  const [modalMode, setModalMode] = useState<ReceiptModalMode>("create");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ReceiptFormValues>(createDefaultFormValues());

  const filtered = useMemo(
    () =>
      filterReceipts(receipts, {
        searchQuery,
        currency,
        dateFrom: dateRange?.from,
        dateTo: dateRange?.to,
      }),
    [receipts, searchQuery, currency, dateRange],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / RECEIPTS_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const selected = receipts.find((receipt) => receipt.id === selectedId) ?? null;
  const receiptToDelete = receipts.find((receipt) => receipt.id === deleteId) ?? null;

  const withFirstPage =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const openCreate = () => {
    setModalMode("create");
    setFormValues(createDefaultFormValues());
    setIsModalOpen(true);
  };

  const openEdit = (receipt: Receipt) => {
    setModalMode("edit");
    setSelectedId(receipt.id);
    setFormValues(mapReceiptToFormValues(receipt));
    setIsModalOpen(true);
  };

  const handleFieldChange = (
    field: ReceiptFormField,
    value: ReceiptFormValues[ReceiptFormField],
  ) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = () => {
    if (modalMode === "edit" && selectedId) {
      setReceipts((current) =>
        current.map((receipt) =>
          receipt.id === selectedId ? mapFormValuesToReceipt(formValues, receipt.id) : receipt,
        ),
      );
    } else {
      const created = mapFormValuesToReceipt(formValues, `receipt-${Date.now()}`);
      setReceipts((current) => [created, ...current]);
      setSelectedId(created.id);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    setReceipts((current) => current.filter((receipt) => receipt.id !== deleteId));
    if (selectedId === deleteId) setSelectedId(null);
    setDeleteId(null);
  };

  return (
    <div className={receiptsPageContentReceiptsPage.page}>
      <div className={receiptsPageContentReceiptsPage.header}>
        <p className={receiptsPageContentReceiptsPage.description}>
          Facturas y boletas de proveedores, vinculadas al gasto que respaldan.
        </p>
        <BoardButton onClick={openCreate} variant="primary">
          <Upload aria-hidden="true" className={receiptsPageContentReceiptsPage.actionIcon} />
          Subir boleta
        </BoardButton>
      </div>

      <ReceiptsToolbar
        currency={currency}
        dateRange={dateRange}
        onCurrencyChange={withFirstPage(setCurrency)}
        onDateRangeChange={withFirstPage(setDateRange)}
        onSearchChange={withFirstPage(setSearchQuery)}
        searchQuery={searchQuery}
      />

      <div className={receiptsPageContentReceiptsPage.split}>
        <ReceiptsTable
          errorMessage={initialErrorMessage}
          onPageChange={setPage}
          onSelect={(receipt) => setSelectedId(receipt.id)}
          page={currentPage}
          pageCount={pageCount}
          receipts={paginateReceipts(filtered, currentPage)}
          selectedId={selectedId}
          total={filtered.length}
        />
        <ReceiptDetailPanel
          onDelete={(receipt) => setDeleteId(receipt.id)}
          onEdit={openEdit}
          receipt={selected}
        />
      </div>

      <ReceiptModal
        mode={modalMode}
        onCancel={() => setIsModalOpen(false)}
        onFieldChange={handleFieldChange}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
        open={isModalOpen}
        relatedOptions={relatedOptions}
        requiredFields={[]}
        values={formValues}
      />

      <ReceiptDeleteDialog
        onCancel={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        open={deleteId !== null}
        receiptNumber={receiptToDelete?.number}
      />
    </div>
  );
}
