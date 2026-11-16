"use client";

import type { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { NewPodcastFormValues } from "../../schema";

interface TitleFieldProps {
  control: Control<NewPodcastFormValues>;
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
              placeholder="Escribe el título del episodio..."
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
