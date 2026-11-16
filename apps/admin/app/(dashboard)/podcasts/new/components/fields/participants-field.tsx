"use client";

import { UserCheck, UserPlus, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Control } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import type { PodcastHost } from "@/app/(dashboard)/podcasts/types";
import { Badge } from "@/components/ui/badge";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { NewPodcastFormValues, PodcastParticipant } from "../../schema";

interface ParticipantsFieldProps {
  control: Control<NewPodcastFormValues>;
  platformHosts: PodcastHost[];
}

interface SuggestionItem {
  type: "internal" | "external";
  name: string;
  hostId?: string;
}

export function ParticipantsField({ control, platformHosts }: ParticipantsFieldProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setValue, getValues } = useFormContext<NewPodcastFormValues>();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentParticipants = (): PodcastParticipant[] => getValues("participants") ?? [];

  const isAlreadyAdded = (name: string) =>
    currentParticipants().some((p) => p.name.toLowerCase() === name.toLowerCase());

  const suggestions = (): SuggestionItem[] => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const matchingHosts = platformHosts
      .filter(
        (h) => h.name.toLowerCase().includes(trimmed.toLowerCase()) && !isAlreadyAdded(h.name),
      )
      .map<SuggestionItem>((h) => ({
        type: "internal",
        name: h.name,
        hostId: h.id,
      }));

    // Offer "add as external" only if the query doesn't exactly match a host
    const exactMatch = platformHosts.some((h) => h.name.toLowerCase() === trimmed.toLowerCase());
    const externalOption: SuggestionItem[] =
      !exactMatch && !isAlreadyAdded(trimmed) ? [{ type: "external", name: trimmed }] : [];

    return [...matchingHosts, ...externalOption];
  };

  const addParticipant = (item: SuggestionItem) => {
    const next: PodcastParticipant = {
      name: item.name,
      isExternal: item.type === "external",
      hostId: item.hostId,
    };
    setValue("participants", [...currentParticipants(), next], {
      shouldValidate: true,
    });
    setQuery("");
    setOpen(false);
  };

  const removeParticipant = (name: string) => {
    setValue(
      "participants",
      currentParticipants().filter((p) => p.name !== name),
      { shouldValidate: true },
    );
  };

  const list = suggestions();

  return (
    <FormField
      control={control}
      name="participants"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Participantes *</FormLabel>

          {/* Selected participants */}
          {(field.value ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-1">
              {(field.value ?? []).map((p) => (
                <Badge
                  key={p.name}
                  variant={p.isExternal ? "secondary" : "default"}
                  className={cn("gap-1 pr-1", !p.isExternal && "bg-accent text-accent-foreground")}
                >
                  {p.isExternal ? (
                    <UserPlus className="size-3 shrink-0" />
                  ) : (
                    <UserCheck className="size-3 shrink-0" />
                  )}
                  {p.name}
                  <button
                    type="button"
                    onClick={() => removeParticipant(p.name)}
                    className="rounded-full hover:bg-black/10 p-0.5"
                    aria-label={`Quitar a ${p.name}`}
                  >
                    <X className="size-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Search input + dropdown */}
          <div ref={containerRef} className="relative">
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder="Buscar miembro o escribir nombre externo..."
                className={cn("pl-9", fieldState.error && "border-destructive")}
              />
            </div>

            {open && list.length > 0 && (
              <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-md overflow-hidden">
                {list.map((item) => (
                  <button
                    key={`${item.type}-${item.name}`}
                    type="button"
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                    onMouseDown={(e) => {
                      // Prevent input blur before click registers
                      e.preventDefault();
                      addParticipant(item);
                    }}
                  >
                    {item.type === "internal" ? (
                      <>
                        <UserCheck className="size-4 text-primary shrink-0" />
                        <span className="flex-1">{item.name}</span>
                        <span className="text-xs text-muted-foreground">Plataforma</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="size-4 text-muted-foreground shrink-0" />
                        <span className="flex-1">
                          Agregar como externo: <strong className="font-medium">{item.name}</strong>
                        </span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-start gap-1">
            <span className="text-xs text-muted-foreground">
              <UserCheck className="size-3 inline mr-0.5" />
              Plataforma
            </span>
            <span className="text-xs text-muted-foreground mx-1">·</span>
            <span className="text-xs text-muted-foreground">
              <UserPlus className="size-3 inline mr-0.5" />
              Externo
            </span>
          </div>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
