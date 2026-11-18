"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateMovementDialog } from "@/components/create-movement-dialog";
import { MovementsTable } from "@/components/movements-table";
import { Button } from "@/components/ui/button";
import type { Movement } from "@/lib/types";

interface ProjectMovementsProps {
  projectName: string;
  movements: Movement[];
  canEdit?: boolean;
  onCreateMovement: (movement: Omit<Movement, "id">) => void;
}

export function ProjectMovements({
  projectName,
  movements,
  canEdit = false,
  onCreateMovement,
}: ProjectMovementsProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const totalIncome = movements
    .filter((m) => m.type === "income")
    .reduce((sum, m) => sum + m.amount, 0);

  const totalExpense = movements
    .filter((m) => m.type === "expense")
    .reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Ingresos Totales</p>
            <p className="text-lg font-semibold text-income">+${totalIncome.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gastos Totales</p>
            <p className="text-lg font-semibold text-expense">-${totalExpense.toLocaleString()}</p>
          </div>
        </div>
        {canEdit && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            Añadir Movimiento
          </Button>
        )}
      </div>

      {/* Movements Table */}
      <MovementsTable movements={movements} />

      <CreateMovementDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={onCreateMovement}
        fixedProject={projectName}
      />
    </div>
  );
}
