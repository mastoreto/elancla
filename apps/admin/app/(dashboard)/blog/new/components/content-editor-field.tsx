"use client";

import type { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RichTextEditor } from "@/src/components/RichTextEditor";
import type { NewPostFormValues } from "../schema";

interface ContentEditorFieldProps {
  control: Control<NewPostFormValues>;
}

export function ContentEditorField({ control }: ContentEditorFieldProps) {
  return (
    <FormField
      control={control}
      name="content"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Contenido *</FormLabel>
          <FormControl>
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              placeholder="Escribe el contenido del artículo aquí..."
              hasError={!!fieldState.error}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
