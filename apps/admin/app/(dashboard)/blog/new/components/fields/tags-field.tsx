"use client";

import { X } from "lucide-react";
import { type KeyboardEvent, useState } from "react";
import type { Control } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { NewPostFormValues } from "../../schema";

interface TagsFieldProps {
  control: Control<NewPostFormValues>;
}

export function TagsField({ control }: TagsFieldProps) {
  const [inputValue, setInputValue] = useState("");
  const { setValue, getValues } = useFormContext<NewPostFormValues>();

  const addTag = (raw: string) => {
    const tag = raw.trim().toLowerCase();
    if (!tag) return;
    const current = getValues("tags") ?? [];
    if (current.includes(tag)) return;
    setValue("tags", [...current, tag], { shouldValidate: true });
    setInputValue("");
  };

  const removeTag = (tag: string) => {
    const current = getValues("tags") ?? [];
    setValue(
      "tags",
      current.filter((t) => t !== tag),
      { shouldValidate: true },
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "") {
      const current = getValues("tags") ?? [];
      if (current.length > 0) {
        removeTag(current[current.length - 1]);
      }
    }
  };

  return (
    <FormField
      control={control}
      name="tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tags *</FormLabel>
          <div className="rounded-lg border border-input bg-background p-2 focus-within:ring-1 focus-within:ring-ring">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {(field.value ?? []).map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="rounded-full hover:bg-muted p-0.5"
                    aria-label={`Eliminar tag ${tag}`}
                  >
                    <X className="size-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => addTag(inputValue)}
              placeholder="Escribe y presiona Enter o coma para agregar..."
              className="border-0 p-0 h-auto text-sm focus-visible:ring-0 shadow-none"
            />
          </div>
          <p className="text-xs text-muted-foreground">Presiona Enter o coma para agregar un tag</p>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
