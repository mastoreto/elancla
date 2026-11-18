"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { NewPostFormValues } from "../../schema";

interface PublicationDateFieldProps {
  control: Control<NewPostFormValues>;
}

export function PublicationDateField({ control }: PublicationDateFieldProps) {
  return (
    <FormField
      control={control}
      name="publishedAt"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Fecha de publicación *</FormLabel>
          <Popover>
            <PopoverTrigger asChild={true}>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {field.value
                    ? format(field.value, "PPP", { locale: es })
                    : "Selecciona una fecha"}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                autoFocus={true}
                locale={es}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
