"use client";

import { Link } from "lucide-react";
import type { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { NewPodcastFormValues } from "../../schema";

interface LinkFieldProps {
  control: Control<NewPodcastFormValues>;
}

export function LinkField({ control }: LinkFieldProps) {
  return (
    <FormField
      control={control}
      name="link"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Link del episodio *</FormLabel>
          <FormControl>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                type="url"
                placeholder="https://open.spotify.com/episode/..."
                className="pl-9"
                {...field}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
