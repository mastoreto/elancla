"use client";

import { ImagePlus, X } from "lucide-react";
import { type ChangeEvent, useRef } from "react";
import type { Control } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { NewPostFormValues } from "../schema";

interface HeroImageUploadFieldProps {
  control: Control<NewPostFormValues>;
}

export function HeroImageUploadField({ control }: HeroImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setValue } = useFormContext<NewPostFormValues>();

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setValue("heroImage", previewUrl, { shouldValidate: true });
  };

  const clearImage = () => {
    setValue("heroImage", "", { shouldValidate: true });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <FormField
      control={control}
      name="heroImage"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Imagen hero *</FormLabel>

          {field.value ? (
            <div className="relative rounded-lg overflow-hidden border border-input">
              {/* biome-ignore lint/performance/noImgElement: preview image doesn't need next/image optimization */}
              <img src={field.value} alt="Vista previa hero" className="w-full h-40 object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 size-7"
                onClick={clearImage}
                aria-label="Quitar imagen"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                "w-full rounded-lg border-2 border-dashed p-6 transition-colors",
                "flex flex-col items-center gap-2 text-center",
                "hover:border-primary/60 hover:bg-muted/30",
                fieldState.error ? "border-destructive" : "border-input",
              )}
            >
              <ImagePlus className="size-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Haz clic para seleccionar una imagen
              </span>
              <span className="text-xs text-muted-foreground">
                JPG, PNG, WebP · Recomendado: 1200×630 px
              </span>
            </button>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFile}
          />

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
