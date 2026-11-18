"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SermonStatusFilter } from "../types";

interface SermonsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  status: SermonStatusFilter;
  onStatusChange: (value: SermonStatusFilter) => void;
  counts: Record<SermonStatusFilter, number>;
}

const tabs: { value: SermonStatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "published", label: "Publicados" },
  { value: "draft", label: "Borradores" },
];

const sermonsToolbarSermonsPage = {
  container: cn("flex flex-col gap-4"),
  search: cn("relative w-full lg:max-w-sm"),
  searchIcon: cn("absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"),
  searchInput: cn("pl-9"),
  tabs: cn("flex flex-wrap gap-2"),
  tab: cn(
    "inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm font-medium text-tinta-suave transition hover:border-foreground",
  ),
  tabActive: cn("border-primary bg-primary/10 text-primary"),
  tabCount: cn("rounded-full bg-muted px-1.5 text-xs tabular-nums"),
};

export function SermonsToolbar({
  searchQuery,
  onSearchChange,
  status,
  onStatusChange,
  counts,
}: SermonsToolbarProps) {
  return (
    <div className={sermonsToolbarSermonsPage.container}>
      {/* biome-ignore lint/a11y/useSemanticElements: segmented toggle; a fieldset would need its default borders reset. */}
      <div className={sermonsToolbarSermonsPage.search}>
        <Search aria-hidden="true" className={sermonsToolbarSermonsPage.searchIcon} />
        <Input
          aria-label="Buscar sermón, predicador o pasaje"
          className={sermonsToolbarSermonsPage.searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar sermón, predicador o pasaje…"
          value={searchQuery}
        />
      </div>
      {/* biome-ignore lint/a11y/useSemanticElements: segmented toggle; a fieldset would need its default borders reset. */}
      <div aria-label="Estado del sermón" className={sermonsToolbarSermonsPage.tabs} role="group">
        {tabs.map((tab) => (
          <button
            aria-pressed={status === tab.value}
            className={cn(
              sermonsToolbarSermonsPage.tab,
              status === tab.value && sermonsToolbarSermonsPage.tabActive,
            )}
            key={tab.value}
            onClick={() => onStatusChange(tab.value)}
            type="button"
          >
            {tab.label}
            <span className={sermonsToolbarSermonsPage.tabCount}>{counts[tab.value]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
