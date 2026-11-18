"use client";

import { Eye, PencilLine, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { BoardPagination } from "@/components/dashboard/board/board-pagination";
import {
  BoardTableHead,
  BoardTableList,
  BoardTableRow,
  boardTableRaisedClass,
  boardTableRowLinkClass,
} from "@/components/dashboard/board/board-table";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { RowIconButton, rowIconButtonClass } from "@/components/dashboard/board/row-icon-button";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { InventoryItem } from "../types";
import { getInventoryAppearance } from "../utils";
import { InventoryDeleteDialog } from "./inventory-delete-dialog";
import { InventoryStatusBadge } from "./inventory-status-badge";

interface InventoryTableProps {
  items: readonly InventoryItem[];
}

const INVENTORY_PAGE_SIZE = 10;
const COLUMNS = "1.8fr 1fr 1.2fr 60px 140px 110px 130px";
const HEADERS = ["Ítem", "Categoría", "Ubicación", "Cant.", "Estado", "Valor", "Acciones"];

const inventoryTableInventoryPage = {
  card: cn("flex flex-col gap-1 p-[18px]"),
  name: cn("flex min-w-0 items-center gap-3"),
  bubble: cn("size-[38px]"),
  nameText: cn("flex min-w-0 flex-col gap-0.5"),
  link: cn("font-bold", boardTableRowLinkClass),
  code: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  muted: cn("text-[var(--tinta-suave)]"),
  quantity: cn("tabular-nums"),
  value: cn("text-[13.5px] tabular-nums"),
  actions: cn("flex justify-end gap-1.5", boardTableRaisedClass),
  icon: cn("size-4"),
  empty: cn("py-10 text-center text-sm text-[var(--tinta-apagada)]"),
};

export function InventoryTable({ items }: InventoryTableProps) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / INVENTORY_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = items.slice(
    (currentPage - 1) * INVENTORY_PAGE_SIZE,
    currentPage * INVENTORY_PAGE_SIZE,
  );

  return (
    <BoardCard className={inventoryTableInventoryPage.card}>
      <BoardTableHead columns={COLUMNS} labels={HEADERS} />
      {visible.length === 0 ? (
        <p className={inventoryTableInventoryPage.empty}>No hay ítems encontrados.</p>
      ) : (
        <BoardTableList>
          {visible.map((item) => {
            const { icon: Icon, tone } = getInventoryAppearance(item);
            const detailHref = getChurchRoutePath("inventory", item.id);
            return (
              <BoardTableRow columns={COLUMNS} key={item.id}>
                <div className={inventoryTableInventoryPage.name}>
                  <IconBubble className={inventoryTableInventoryPage.bubble} tone={tone}>
                    <Icon aria-hidden="true" className={inventoryTableInventoryPage.icon} />
                  </IconBubble>
                  <div className={inventoryTableInventoryPage.nameText}>
                    <Link className={inventoryTableInventoryPage.link} href={detailHref}>
                      {item.name}
                    </Link>
                    <span className={inventoryTableInventoryPage.code}>{item.code}</span>
                  </div>
                </div>
                <span className={inventoryTableInventoryPage.muted}>{item.category}</span>
                <span className={inventoryTableInventoryPage.muted}>{item.location}</span>
                <b className={inventoryTableInventoryPage.quantity}>{item.quantity}</b>
                <span>
                  <InventoryStatusBadge status={item.status} />
                </span>
                <b className={inventoryTableInventoryPage.value}>{item.value}</b>
                <div className={inventoryTableInventoryPage.actions}>
                  <RowIconButton href={detailHref} label={`Ver ${item.name}`}>
                    <Eye aria-hidden="true" className={inventoryTableInventoryPage.icon} />
                  </RowIconButton>
                  <RowIconButton href={`${detailHref}/edit`} label={`Editar ${item.name}`}>
                    <PencilLine aria-hidden="true" className={inventoryTableInventoryPage.icon} />
                  </RowIconButton>
                  <InventoryDeleteDialog
                    itemCode={item.code}
                    itemName={item.name}
                    trigger={
                      <button
                        aria-label={`Eliminar ${item.name}`}
                        className={rowIconButtonClass}
                        type="button"
                      >
                        <Trash2 aria-hidden="true" className={inventoryTableInventoryPage.icon} />
                      </button>
                    }
                  />
                </div>
              </BoardTableRow>
            );
          })}
        </BoardTableList>
      )}
      <BoardPagination
        onPageChange={setPage}
        page={currentPage}
        pageCount={pageCount}
        pageSize={INVENTORY_PAGE_SIZE}
        total={items.length}
      />
    </BoardCard>
  );
}
