"use client";

import type { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { NewPodcastFormValues } from "../../schema";

interface DescriptionFieldProps {
  control: Control<NewPodcastFormValues>;
}

export function DescriptionField({ control }: DescriptionFieldProps) {
  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Descripción *</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Resume de qué trata este episodio (máx. 500 caracteres)..."
              rows={4}
              className="resize-none"
              {...field}
            />
          </FormControl>
          <div className="flex justify-between">
            <FormMessage />
            <span className="text-xs text-muted-foreground ml-auto">
              {field.value?.length ?? 0}/500
            </span>
          </div>
        </FormItem>
      )}
    />
  );
}
