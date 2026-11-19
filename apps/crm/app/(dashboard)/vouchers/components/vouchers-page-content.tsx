"use client";

import { PERMISSIONS } from "@ancla/contracts";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { Can } from "@/lib/authz/Gate";
import { cn } from "@/lib/utils";
import type {
  Voucher,
  VoucherFormField,
  VoucherFormValues,
  VoucherModalMode,
  VoucherRelatedOption,
} from "../types";
import {
  createDefaultFormValues,
  filterVouchers,
  getUniqueResponsibles,
  mapFormValuesToVoucher,
  mapVoucherToFormValues,
  paginateVouchers,
  VOUCHERS_PAGE_SIZE,
} from "../utils";
import { VoucherDeleteDialog } from "./voucher-delete-dialog";
import { VoucherGuidanceCard } from "./voucher-guidance-card";
import { VoucherJustificationCard } from "./voucher-justification-card";
import { VoucherModal } from "./voucher-modal";
import { VouchersTable } from "./vouchers-table";
import { VouchersToolbar } from "./vouchers-toolbar";

interface VouchersPageContentProps {
  initialVouchers: Voucher[];
  relatedOptions: VoucherRelatedOption[];
  initialErrorMessage?: string | null;
}

const vouchersPageContentVouchersPage = {
  page: cn("flex flex-col gap-5"),
  header: cn("flex flex-wrap items-center gap-4"),
  description: cn("min-w-60 flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  actionIcon: cn("size-4"),
  split: cn("grid items-start gap-[18px] xl:grid-cols-[1.7fr_1fr]"),
  aside: cn("flex flex-col gap-4"),
};

export function VouchersPageContent({
  initialVouchers,
  relatedOptions,
  initialErrorMessage = null,
}: VouchersPageContentProps) {
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [searchQuery, setSearchQuery] = useState("");
  const [responsible, setResponsible] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(initialVouchers[0]?.id ?? null);
  const [modalMode, setModalMode] = useState<VoucherModalMode>("create");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<VoucherFormValues>(createDefaultFormValues());

  const responsibles = useMemo(() => getUniqueResponsibles(vouchers), [vouchers]);
  const filtered = useMemo(
    () =>
      filterVouchers(vouchers, {
        searchQuery,
        responsible,
        dateFrom: dateRange?.from,
        dateTo: dateRange?.to,
      }),
    [vouchers, searchQuery, responsible, dateRange],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / VOUCHERS_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const selected = vouchers.find((voucher) => voucher.id === selectedId) ?? null;
  const voucherToDelete = vouchers.find((voucher) => voucher.id === deleteId) ?? null;

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

  const openEdit = (voucher: Voucher) => {
    setModalMode("edit");
    setSelectedId(voucher.id);
    setFormValues(mapVoucherToFormValues(voucher, relatedOptions));
    setIsModalOpen(true);
  };

  const handleFieldChange = (
    field: VoucherFormField,
    value: VoucherFormValues[VoucherFormField],
  ) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = () => {
    if (modalMode === "edit" && selectedId) {
      setVouchers((current) =>
        current.map((voucher) =>
          voucher.id === selectedId
            ? mapFormValuesToVoucher(formValues, voucher.id, relatedOptions)
            : voucher,
        ),
      );
    } else {
      const created = mapFormValuesToVoucher(formValues, `voucher-${Date.now()}`, relatedOptions);
      setVouchers((current) => [created, ...current]);
      setSelectedId(created.id);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    setVouchers((current) => current.filter((voucher) => voucher.id !== deleteId));
    if (selectedId === deleteId) setSelectedId(null);
    setDeleteId(null);
  };

  return (
    <div className={vouchersPageContentVouchersPage.page}>
      <div className={vouchersPageContentVouchersPage.header}>
        <p className={vouchersPageContentVouchersPage.description}>
          Respaldo interno para gastos sin boleta, con justificación y responsable.
        </p>
        <Can permission={PERMISSIONS.vouchers.create}>
          <BoardButton onClick={openCreate} variant="primary">
            <Plus aria-hidden="true" className={vouchersPageContentVouchersPage.actionIcon} />
            Nuevo comprobante
          </BoardButton>
        </Can>
      </div>

      <VouchersToolbar
        dateRange={dateRange}
        onDateRangeChange={withFirstPage(setDateRange)}
        onResponsibleChange={withFirstPage(setResponsible)}
        onSearchChange={withFirstPage(setSearchQuery)}
        responsible={responsible}
        responsibles={responsibles}
        searchQuery={searchQuery}
      />

      <div className={vouchersPageContentVouchersPage.split}>
        <VouchersTable
          errorMessage={initialErrorMessage}
          onEdit={openEdit}
          onPageChange={setPage}
          onSelect={(voucher) => setSelectedId(voucher.id)}
          page={currentPage}
          pageCount={pageCount}
          selectedId={selectedId}
          total={filtered.length}
          vouchers={paginateVouchers(filtered, currentPage)}
        />
        <div className={vouchersPageContentVouchersPage.aside}>
          <VoucherGuidanceCard />
          <VoucherJustificationCard
            onDelete={(voucher) => setDeleteId(voucher.id)}
            voucher={selected}
          />
        </div>
      </div>

      <VoucherModal
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

      <VoucherDeleteDialog
        onCancel={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        open={deleteId !== null}
        voucherDescription={voucherToDelete?.description}
      />
    </div>
  );
}
