"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { CreateMovementDialog } from "@/components/create-movement-dialog";
import { MovementsFilters } from "@/components/movements-filters";
import { MovementsTable } from "@/components/movements-table";
import { Button } from "@/components/ui/button";
import { movements as allMovements } from "@/lib/data";
import type { Movement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DashboardPageHeader } from "@/src/componentes/dashboard";

const movementsPage = {
  page: cn("space-y-6"),
  action: cn("rounded-full"),
  count: cn("text-sm text-muted-foreground"),
};

export default function MovementsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currency, setCurrency] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [movements, setMovements] = useState<Movement[]>(allMovements);

  const hasActiveFilters = currency !== "all" || !!dateRange || searchQuery.length > 0;

  const filteredMovements = useMemo(() => {
    return movements
      .filter((movement) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesConcept = movement.concept.toLowerCase().includes(query);
          const matchesDescription = movement.description?.toLowerCase().includes(query);
          const matchesProject = movement.project?.toLowerCase().includes(query);
          if (!matchesConcept && !matchesDescription && !matchesProject) {
            return false;
          }
        }

        // Currency filter
        if (currency !== "all" && movement.currency !== currency) {
          return false;
        }

        // Date range filter
        if (dateRange?.from) {
          const movementDate = new Date(movement.date);
          if (movementDate < dateRange.from) {
            return false;
          }
          if (dateRange.to && movementDate > dateRange.to) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [movements, searchQuery, currency, dateRange]);

  const clearFilters = () => {
    setSearchQuery("");
    setCurrency("all");
    setDateRange(undefined);
  };

  const handleCreateMovement = (newMovement: Omit<Movement, "id">) => {
    const movement: Movement = {
      ...newMovement,
      id: String(movements.length + 1),
    };
    setMovements([movement, ...movements]);
  };

  return (
    <div className={movementsPage.page}>
      <DashboardPageHeader
        actions={
          <Button className={movementsPage.action} onClick={() => setIsCreateOpen(true)} type="button">
            <Plus aria-hidden="true" />
            Nuevo movimiento
          </Button>
        }
        description="Registro de ingresos y egresos de la iglesia en pesos y dólares."
        emphasis="de tesorería"
        kicker="Tesorería"
        title="Movimientos"
      />

      {/* Filters */}
      <MovementsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currency={currency}
        onCurrencyChange={setCurrency}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Results Count */}
      <div className={movementsPage.count}>
        Mostrando {filteredMovements.length} de {movements.length} movimientos
      </div>

      {/* Table */}
      <MovementsTable movements={filteredMovements} />

      {/* Create Movement Dialog */}
      <CreateMovementDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateMovement}
      />
    </div>
  );
}
