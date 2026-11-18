"use client";

import type { Control } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import type { BlogCategory } from "@/app/(dashboard)/blog/types";
import { Badge } from "@/components/ui/badge";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { NewPostFormValues } from "../../schema";

const categoryFieldContentPage = {
  options: cn("flex flex-wrap gap-2 rounded-lg border border-input bg-background p-3"),
  option: cn("cursor-pointer select-none transition-colors"),
  optionActive: cn("bg-accent text-accent-foreground hover:bg-accent/80"),
};

interface CategoryFieldProps {
  control: Control<NewPostFormValues>;
  categories: BlogCategory[];
}

export function CategoryField({ control, categories }: CategoryFieldProps) {
  const { setValue, getValues } = useFormContext<NewPostFormValues>();

  const toggle = (id: string) => {
    const current = getValues("categoryIds") ?? [];
    const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id];
    setValue("categoryIds", next, { shouldValidate: true });
  };

  return (
    <FormField
      control={control}
      name="categoryIds"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Categoría *</FormLabel>
          <div className={categoryFieldContentPage.options}>
            {categories.map((cat) => {
              const selected = (field.value ?? []).includes(cat.id);
              return (
                <Badge
                  key={cat.id}
                  variant={selected ? "default" : "outline"}
                  className={cn(
                    categoryFieldContentPage.option,
                    selected ? categoryFieldContentPage.optionActive : "hover:bg-muted",
                  )}
                  onClick={() => toggle(cat.id)}
                >
                  {cat.label}
                </Badge>
              );
            })}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
