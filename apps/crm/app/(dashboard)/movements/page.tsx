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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movimientos</h1>
          <p className="text-muted-foreground">Realiza seguimiento a todos los ingresos y gastos</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="size-4" />
          Nuevo Movimiento
        </Button>
      </div>

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
      <div className="text-sm text-muted-foreground">
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
