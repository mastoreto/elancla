import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { InventoryItem } from "../types";
import { InventoryStatusBadge } from "./inventory-status-badge";

const inventoryTableInventoryPage = {
  headRow: cn("bg-bruma hover:bg-bruma"),
  numeric: cn("text-right"),
  numericCell: cn("text-right tabular-nums"),
  name: cn("font-semibold hover:underline"),
  code: cn("font-mono text-[11px] text-muted-foreground"),
};

interface InventoryTableProps {
  items: readonly InventoryItem[];
}

export function InventoryTable({ items }: InventoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className={inventoryTableInventoryPage.headRow}>
          <TableHead>Ítem</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Ubicación</TableHead>
          <TableHead className={inventoryTableInventoryPage.numeric}>Cant.</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className={inventoryTableInventoryPage.numeric}>Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <Link
                className={inventoryTableInventoryPage.name}
                href={getChurchRoutePath("inventory", item.id)}
              >
                {item.name}
              </Link>
              <p className={inventoryTableInventoryPage.code}>{item.code}</p>
            </TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell>{item.location}</TableCell>
            <TableCell className={inventoryTableInventoryPage.numericCell}>
              {item.quantity}
            </TableCell>
            <TableCell>
              <InventoryStatusBadge status={item.status} />
            </TableCell>
            <TableCell className={inventoryTableInventoryPage.numericCell}>{item.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
