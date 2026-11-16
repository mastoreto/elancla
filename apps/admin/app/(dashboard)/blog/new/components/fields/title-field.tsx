"use client";

import type { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { NewPostFormValues } from "../../schema";

interface TitleFieldProps {
  control: Control<NewPostFormValues>;
}

export function TitleField({ control }: TitleFieldProps) {
  return (
    <FormField
      control={control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Título *</FormLabel>
          <FormControl>
            <Input
              placeholder="Escribe un título descriptivo para el artículo..."
              className="text-base"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
