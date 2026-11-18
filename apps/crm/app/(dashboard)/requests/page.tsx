"use client";

import { isWithinInterval, parseISO } from "date-fns";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { RequestFilters } from "@/components/request-filters";
import { RequestFormModal } from "@/components/request-form-modal";
import { RequestTable } from "@/components/request-table";
import { currentUser, moneyRequests as initialRequests } from "@/lib/data";
import type { Currency, MoneyRequest, RequestStatus } from "@/lib/types";

export default function RequestsPage() {
  const [requests, setRequests] = useState<MoneyRequest[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [ministryFilter, setMinistryFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const filteredRequests = useMemo(() => {
    return requests
      .filter((request) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesSearch =
            request.concept.toLowerCase().includes(query) ||
            request.ministry.toLowerCase().includes(query) ||
            request.leader.toLowerCase().includes(query) ||
            (request.description?.toLowerCase().includes(query) ?? false);
          if (!matchesSearch) return false;
        }

        // Status filter
        if (statusFilter !== "all" && request.status !== statusFilter) {
          return false;
        }

        // Ministry filter
        if (ministryFilter !== "all" && request.ministry !== ministryFilter) {
          return false;
        }

        // Date range filter
        if (dateRange?.from) {
          const requestDate = parseISO(request.date);
          if (dateRange.to) {
            if (!isWithinInterval(requestDate, { start: dateRange.from, end: dateRange.to })) {
              return false;
            }
          } else if (requestDate < dateRange.from) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [requests, searchQuery, statusFilter, ministryFilter, dateRange]);

  const handleApprove = (requestId: string, comment?: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: "approved" as RequestStatus,
              timeline: [
                ...req.timeline,
                {
                  id: `${req.timeline.length + 1}`,
                  action: "approved" as const,
                  user: currentUser.name,
                  date: new Date().toISOString(),
                  comment,
                },
              ],
            }
          : req,
      ),
    );
  };

  const handleReject = (requestId: string, comment?: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: "rejected" as RequestStatus,
              timeline: [
                ...req.timeline,
                {
                  id: `${req.timeline.length + 1}`,
                  action: "rejected" as const,
                  user: currentUser.name,
                  date: new Date().toISOString(),
                  comment,
                },
              ],
            }
          : req,
      ),
    );
  };

  const handleCreateRequest = (data: {
    date: Date;
    concept: string;
    description: string;
    ministry: string;
    leader: string;
    currency: Currency;
    amount: number;
  }) => {
    const newRequest: MoneyRequest = {
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
        {
          id: "1",
          action: "created",
          user: currentUser.name,
          date: new Date().toISOString(),
        },
      ],
    };
    setRequests((prev) => [newRequest, ...prev]);
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Solicitudes de Fondos
          </h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount} pendiente{pendingCount === 1 ? "" : "s"}, {approvedCount} aprobada
            {approvedCount === 1 ? "" : "s"}, {rejectedCount} rechazada
            {rejectedCount === 1 ? "" : "s"}
          </p>
        </div>
        <RequestFormModal onSubmit={handleCreateRequest} />
      </div>

      <RequestFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        ministryFilter={ministryFilter}
        onMinistryChange={setMinistryFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <RequestTable requests={filteredRequests} onApprove={handleApprove} onReject={handleReject} />
    </div>
  );
}
