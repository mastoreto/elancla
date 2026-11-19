import type { AuditLogDto } from "@ancla/contracts";
import {
  BoardTableHead,
  BoardTableList,
  BoardTableRow,
} from "@/components/dashboard/board/board-table";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { cn } from "@/lib/utils";
import { AUDIT_OUTCOME_LABELS, AUDIT_OUTCOME_TONES, labelOfAction } from "../data/audit-labels";

const COLUMNS = "1.1fr 1.6fr 1.4fr 1.2fr 100px";
const HEADERS = ["Fecha", "Acción", "Sobre", "Quién", "Resultado"];
const DATE_FORMAT = new Intl.DateTimeFormat("es-UY", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: "America/Montevideo",
});

const auditTableSettingsPage = {
  row: cn("flex-col items-stretch sm:grid"),
  summary: cn("contents cursor-pointer"),
  cell: cn("min-w-0 break-words"),
  muted: cn("text-[13px] text-[var(--tinta-suave)]"),
  detail: cn("col-span-full mt-2 grid gap-3 rounded-2xl bg-secondary p-4 sm:grid-cols-2"),
  block: cn("flex min-w-0 flex-col gap-1.5"),
  blockTitle: cn("text-xs font-bold text-[var(--tinta-suave)]"),
  json: cn("max-h-64 overflow-auto rounded-xl bg-card p-3 text-xs leading-relaxed"),
  facts: cn("col-span-full text-xs text-[var(--tinta-suave)]"),
};

function entityLabel(item: AuditLogDto): string {
  const label = (item.metadata as { entityLabel?: unknown } | null)?.entityLabel;
  if (typeof label === "string") return label;
  return item.entityType ? `${item.entityType} ${item.entityId ?? ""}`.trim() : "—";
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  if (value === null || value === undefined) return null;
  return (
    <div className={auditTableSettingsPage.block}>
      <span className={auditTableSettingsPage.blockTitle}>{title}</span>
      <pre className={auditTableSettingsPage.json}>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
}

interface AuditTableProps {
  items: AuditLogDto[];
}

/** Each row opens (native `<details>`, no JS) to show before/after and where it came from. */
export function AuditTable({ items }: AuditTableProps) {
  return (
    <div>
      <BoardTableHead columns={COLUMNS} labels={HEADERS} />
      <BoardTableList>
        {items.map((item) => (
          <BoardTableRow className={auditTableSettingsPage.row} columns={COLUMNS} key={item.id}>
            <details className="contents">
              <summary className={auditTableSettingsPage.summary}>
                <span className={auditTableSettingsPage.cell}>
                  {DATE_FORMAT.format(new Date(item.createdAt))}
                </span>
                <span className={auditTableSettingsPage.cell}>{labelOfAction(item.action)}</span>
                <span className={auditTableSettingsPage.cell}>{entityLabel(item)}</span>
                <span className={auditTableSettingsPage.cell}>{item.actorLabel ?? "—"}</span>
                <StatusPill tone={AUDIT_OUTCOME_TONES[item.outcome]}>
                  {AUDIT_OUTCOME_LABELS[item.outcome]}
                </StatusPill>
              </summary>
              <div className={auditTableSettingsPage.detail}>
                <JsonBlock title="Antes" value={item.before} />
                <JsonBlock title="Después" value={item.after} />
                {item.reason ? (
                  <p className={auditTableSettingsPage.muted}>Motivo: {item.reason}</p>
                ) : null}
                <p className={auditTableSettingsPage.facts}>
                  {item.action} · IP {item.ip ?? "—"} · {item.userAgent ?? "—"} · solicitud{" "}
                  {item.requestId ?? "—"}
                </p>
              </div>
            </details>
          </BoardTableRow>
        ))}
      </BoardTableList>
    </div>
  );
}
