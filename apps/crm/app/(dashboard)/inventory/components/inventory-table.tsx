import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InventoryItem } from "../types";
import { InventoryStatusBadge } from "./inventory-status-badge";

interface InventoryTableProps {
  items: readonly InventoryItem[];
}

export function InventoryTable({ items }: InventoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-bruma hover:bg-bruma">
          <TableHead>Ítem</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Ubicación</TableHead>
          <TableHead className="text-right">Cant.</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <p className="font-semibold">{item.name}</p>
              <p className="font-mono text-[11px] text-muted-foreground">{item.code}</p>
            </TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell>{item.location}</TableCell>
            <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
            <TableCell>
              <InventoryStatusBadge status={item.status} />
            </TableCell>
            <TableCell className="text-right tabular-nums">{item.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
