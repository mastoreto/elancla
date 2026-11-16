"use client";

import type { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { NewPostFormValues } from "../../schema";

interface DescriptionFieldProps {
  control: Control<NewPostFormValues>;
}

export function DescriptionField({ control }: DescriptionFieldProps) {
  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Descripción breve *</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Resume el artículo en pocas palabras (máx. 300 caracteres)..."
              rows={3}
              className="resize-none"
              {...field}
            />
          </FormControl>
          <div className="flex justify-between">
            <FormMessage />
            <span className="text-xs text-muted-foreground ml-auto">
              {field.value?.length ?? 0}/300
            </span>
          </div>
        </FormItem>
      )}
    />
  );
}
