import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { cn } from "@/lib/utils";

export interface InventoryFact {
  label: string;
  value: string;
}

interface InventoryDetailCardProps {
  title: string;
  subtitle: string;
  facts?: readonly InventoryFact[];
  children?: React.ReactNode;
}

const inventoryDetailCardInventoryPage = {
  card: cn("p-6"),
  facts: cn("flex flex-col"),
  fact: cn("flex justify-between gap-3 border-b border-border py-[11px] text-sm"),
  label: cn("text-[var(--tinta-apagada)]"),
  value: cn("text-right font-bold"),
};

export function InventoryDetailCard({
  title,
  subtitle,
  facts = [],
  children,
}: InventoryDetailCardProps) {
  return (
    <BoardCard className={inventoryDetailCardInventoryPage.card}>
      <BoardCardHeader subtitle={subtitle} title={title} />
      <dl className={inventoryDetailCardInventoryPage.facts}>
        {facts.map((fact) => (
          <div className={inventoryDetailCardInventoryPage.fact} key={fact.label}>
            <dt className={inventoryDetailCardInventoryPage.label}>{fact.label}</dt>
            <dd className={inventoryDetailCardInventoryPage.value}>{fact.value}</dd>
          </div>
        ))}
      </dl>
      {children}
    </BoardCard>
  );
}
