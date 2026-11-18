"use client";

import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { DashboardPageHeader } from "@/components/dashboard";
import { RequestFormModal } from "@/components/request-form-modal";
import { currentUser, moneyRequests as initialRequests } from "@/lib/data";
import type { Currency, MoneyRequest, RequestStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  countByStatus,
  filterRequests,
  getPageCount,
  paginate,
  type RequestStatusFilter,
} from "../utils";
import { RequestDetailSheet } from "./request-detail-sheet";
import { RequestsPagination } from "./requests-pagination";
import { RequestsTable } from "./requests-table";
import { RequestsToolbar } from "./requests-toolbar";

const requestsPageContentRequestsPage = {
  page: cn("space-y-6"),
};

type NewRequestData = {
  date: Date;
  concept: string;
  description: string;
  ministry: string;
  leader: string;
  currency: Currency;
  amount: number;
};

function appendDecision(
  request: MoneyRequest,
  status: Extract<RequestStatus, "approved" | "rejected">,
  comment?: string,
): MoneyRequest {
  return {
    ...request,
    status,
    timeline: [
      ...request.timeline,
      {
        id: `${request.timeline.length + 1}`,
        action: status,
        user: currentUser.name,
        date: new Date().toISOString(),
        comment,
      },
    ],
  };
}

export function RequestsPageContent() {
  const [requests, setRequests] = useState<MoneyRequest[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<RequestStatusFilter>("all");
  const [ministry, setMinistry] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(() => countByStatus(requests), [requests]);
  const filtered = useMemo(
    () => filterRequests(requests, { searchQuery, status, ministry, dateRange }),
    [requests, searchQuery, status, ministry, dateRange],
  );
  const pageCount = getPageCount(filtered.length);
  const currentPage = Math.min(page, pageCount);
  const selected = requests.find((request) => request.id === selectedId) ?? null;
  const canDecide = currentUser.role === "admin" || currentUser.role === "treasurer";

  // Changing any filter returns to the first page so results never look empty.
  const withFirstPage =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const decide = (
    requestId: string,
    decision: Extract<RequestStatus, "approved" | "rejected">,
    comment?: string,
  ) => {
    setRequests((previous) =>
      previous.map((request) =>
        request.id === requestId ? appendDecision(request, decision, comment) : request,
      ),
    );
  };

  const createRequest = (data: NewRequestData) => {
    const created: MoneyRequest = {
      id: `${requests.length + 1}`,
      date: data.date.toISOString().split("T")[0],
      concept: data.concept,
      description: data.description || undefined,
      ministry: data.ministry,
      leader: data.leader,
      currency: data.currency,
      amount: data.amount,
      status: "pending",
      timeline: [
        { id: "1", action: "created", user: currentUser.name, date: new Date().toISOString() },
      ],
    };
    setRequests((previous) => [created, ...previous]);
  };

  return (
    <div className={requestsPageContentRequestsPage.page}>
      <DashboardPageHeader
        actions={<RequestFormModal onSubmit={createRequest} />}
        description="Los ministerios piden fondos; tesorería aprueba, rechaza o pide más información."
        emphasis="de fondos"
        kicker="Tesorería"
        title="Solicitudes"
      />

      <RequestsToolbar
        counts={counts}
        dateRange={dateRange}
        ministry={ministry}
        onDateRangeChange={withFirstPage(setDateRange)}
        onMinistryChange={withFirstPage(setMinistry)}
        onSearchChange={withFirstPage(setSearchQuery)}
        onStatusChange={withFirstPage(setStatus)}
        searchQuery={searchQuery}
        status={status}
      />

      <RequestsTable
        onSelect={(request) => setSelectedId(request.id)}
        requests={paginate(filtered, currentPage)}
      />

      <RequestsPagination
        onPageChange={setPage}
        page={currentPage}
        pageCount={pageCount}
        total={filtered.length}
      />

      <RequestDetailSheet
        canDecide={canDecide}
        onApprove={(id, comment) => decide(id, "approved", comment)}
        onClose={() => setSelectedId(null)}
        onReject={(id, comment) => decide(id, "rejected", comment)}
        request={selected}
      />
    </div>
  );
}
