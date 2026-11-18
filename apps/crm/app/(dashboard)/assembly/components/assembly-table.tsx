"use client";

import { Copy, Eye, FileText } from "lucide-react";
import Link from "next/link";
import {
  BoardTableHead,
  BoardTableList,
  BoardTableRow,
  boardTableRaisedClass,
  boardTableRowLinkClass,
} from "@/components/dashboard/board/board-table";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { RowIconButton } from "@/components/dashboard/board/row-icon-button";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { AssemblyReport } from "../types";
import { AssemblyStatusPill } from "./assembly-status-pill";

const COLUMNS = "1.7fr 130px 140px 1.1fr 1fr 80px 90px";
const HEAD_LABELS = ["Informe", "Código", "Estado", "Vigencia", "Lugar", "Accesos", ""];

const assemblyTableAssemblyPage = {
  main: cn("flex min-w-0 items-center gap-3"),
  bubble: cn("size-10"),
  icon: cn("size-[18px]"),
  text: cn("flex min-w-0 flex-col gap-0.5"),
  title: cn("text-sm font-bold after:absolute after:inset-0"),
  assembly: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  code: cn("font-mono text-[13px] tracking-wider"),
  muted: cn("text-[13px] text-[var(--tinta-suave)]"),
  accesses: cn("tabular-nums"),
  actions: cn("flex gap-1.5"),
};

function copyCode(code: string) {
  navigator.clipboard?.writeText(code).catch(() => undefined);
}

export function AssemblyTable({ reports }: { reports: readonly AssemblyReport[] }) {
  return (
    <>
      <BoardTableHead columns={COLUMNS} labels={HEAD_LABELS} />
      <BoardTableList>
        {reports.map((report) => (
          <BoardTableRow columns={COLUMNS} key={report.id}>
            <div className={assemblyTableAssemblyPage.main}>
              <IconBubble
                className={assemblyTableAssemblyPage.bubble}
                tone={report.status === "Abierto" ? "green" : "gold"}
              >
                <FileText aria-hidden="true" className={assemblyTableAssemblyPage.icon} />
              </IconBubble>
              <div className={assemblyTableAssemblyPage.text}>
                <Link
                  className={cn(boardTableRowLinkClass, assemblyTableAssemblyPage.title)}
                  href={getChurchRoutePath("assembly", report.id)}
                >
                  {report.title}
                </Link>
                <span className={assemblyTableAssemblyPage.assembly}>{report.assembly}</span>
              </div>
            </div>
            <b className={assemblyTableAssemblyPage.code}>{report.accessCode}</b>
            <span>
              <AssemblyStatusPill status={report.status} />
            </span>
            <span className={assemblyTableAssemblyPage.muted}>{report.validity}</span>
            <span className={assemblyTableAssemblyPage.muted}>{report.place}</span>
            <b className={assemblyTableAssemblyPage.accesses}>{report.accesses}</b>
            <div className={cn(assemblyTableAssemblyPage.actions, boardTableRaisedClass)}>
              <RowIconButton href={getChurchRoutePath("assembly", report.id)} label="Ver panel">
                <Eye aria-hidden="true" className="size-4" />
              </RowIconButton>
              <RowIconButton label="Copiar código" onClick={() => copyCode(report.accessCode)}>
                <Copy aria-hidden="true" className="size-4" />
              </RowIconButton>
            </div>
          </BoardTableRow>
        ))}
      </BoardTableList>
    </>
  );
}
