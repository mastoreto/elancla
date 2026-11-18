"use client";

import { ImagePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { DashboardPageHeader } from "@/src/componentes/dashboard";
import { sermonSeries } from "../../data/sermons";
import type { SermonFormValues } from "../../types";
import { type SermonFormErrors, sermonFormSchema } from "../schema";

const EMPTY_VALUES: SermonFormValues = {
  title: "",
  preacher: "",
  passage: "",
  summary: "",
  series: "",
  date: "",
  youtubeUrl: "",
};

const newSermonFormSermonsPage = {
  form: cn("space-y-6"),
  card: cn("space-y-5 rounded-xl border border-border bg-card p-6 shadow-card"),
  pair: cn("grid gap-5 md:grid-cols-2"),
  thumbnail: cn("flex items-center justify-between gap-4 rounded-lg border border-dashed p-4"),
  thumbnailHint: cn("text-sm text-muted-foreground"),
  actions: cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"),
};

export function NewSermonForm() {
  const router = useRouter();
  const [values, setValues] = useState<SermonFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<SermonFormErrors>({});

  const update = (field: keyof SermonFormValues, value: string) =>
    setValues((previous) => ({ ...previous, [field]: value }));

  // Seed-data screen: validating and returning to the list stands in for the real save.
  const submit = () => {
    const result = sermonFormSchema.safeParse(values);
    if (!result.success) {
      const next: SermonFormErrors = {};
      for (const issue of result.error.issues) {
        next[issue.path[0] as keyof SermonFormErrors] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    router.push(getChurchRoutePath("sermons"));
  };

  return (
    <form
      className={newSermonFormSermonsPage.form}
      noValidate={true}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <DashboardPageHeader
        description="Completa de arriba hacia abajo y publícalo en la biblioteca."
        emphasis="sermón"
        kicker="Contenido · Sermones"
        title="Nuevo"
      />

      <div className={newSermonFormSermonsPage.card}>
        <Field>
          <FieldLabel htmlFor="sermon-title">Título *</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.title)}
            id="sermon-title"
            onChange={(event) => update("title", event.target.value)}
            value={values.title}
          />
          {errors.title ? <FieldError>{errors.title}</FieldError> : null}
        </Field>

        <div className={newSermonFormSermonsPage.pair}>
          <Field>
            <FieldLabel htmlFor="sermon-preacher">Predicador *</FieldLabel>
            <Input
              aria-invalid={Boolean(errors.preacher)}
              id="sermon-preacher"
              onChange={(event) => update("preacher", event.target.value)}
              value={values.preacher}
            />
            {errors.preacher ? <FieldError>{errors.preacher}</FieldError> : null}
          </Field>
          <Field>
            <FieldLabel htmlFor="sermon-passage">Pasaje bíblico *</FieldLabel>
            <Input
              aria-invalid={Boolean(errors.passage)}
              id="sermon-passage"
              onChange={(event) => update("passage", event.target.value)}
              value={values.passage}
            />
            {errors.passage ? <FieldError>{errors.passage}</FieldError> : null}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="sermon-summary">Resumen</FieldLabel>
          <Textarea
            id="sermon-summary"
            onChange={(event) => update("summary", event.target.value)}
            rows={3}
            value={values.summary}
          />
        </Field>

        <div className={newSermonFormSermonsPage.pair}>
          <Field>
            <FieldLabel>Serie</FieldLabel>
            <Select onValueChange={(value) => update("series", value)} value={values.series}>
              <SelectTrigger aria-label="Serie">
                <SelectValue placeholder="Sin serie" />
              </SelectTrigger>
              <SelectContent>
                {sermonSeries.map((series) => (
                  <SelectItem key={series} value={series}>
                    {series}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="sermon-date">Fecha del culto *</FieldLabel>
            <Input
              aria-invalid={Boolean(errors.date)}
              id="sermon-date"
              onChange={(event) => update("date", event.target.value)}
              type="date"
              value={values.date}
            />
            {errors.date ? <FieldError>{errors.date}</FieldError> : null}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="sermon-youtube">Link de YouTube *</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.youtubeUrl)}
            id="sermon-youtube"
            inputMode="url"
            onChange={(event) => update("youtubeUrl", event.target.value)}
            placeholder="https://youtube.com/watch?v=…"
            value={values.youtubeUrl}
          />
          {errors.youtubeUrl ? <FieldError>{errors.youtubeUrl}</FieldError> : null}
        </Field>

        <div className={newSermonFormSermonsPage.thumbnail}>
          <p className={newSermonFormSermonsPage.thumbnailHint}>
            La tomamos del video de YouTube. Puedes subir otra si prefieres.
          </p>
          <Button type="button" variant="outline">
            <ImagePlus aria-hidden="true" />
            Subir miniatura
          </Button>
        </div>
      </div>

      <div className={newSermonFormSermonsPage.actions}>
        <Button asChild={true} type="button" variant="ghost">
          <Link href={getChurchRoutePath("sermons")}>Cancelar</Link>
        </Button>
        <Button type="button" variant="outline">
          Guardar borrador
        </Button>
        <Button type="submit">Publicar sermón</Button>
      </div>
    </form>
  );
}
