"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, FileText, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { BlogAuthor, BlogCategory } from "@/app/(dashboard)/blog/types";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { type NewPostFormValues, newPostSchema } from "../schema";
import { AuthorDisplay } from "./author-display";
import { ContentEditorField } from "./content-editor-field";
import { CategoryField } from "./fields/category-field";
import { DescriptionField } from "./fields/description-field";
import { PublicationDateField } from "./fields/publication-date-field";
import { TagsField } from "./fields/tags-field";
import { TitleField } from "./fields/title-field";
import { HeroImageUploadField } from "./hero-image-upload-field";

const newPostFormContentPage = {
  header: cn("flex items-center justify-between gap-4 mb-6"),
  layout: cn("grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start"),
};

interface NewPostFormProps {
  author: BlogAuthor;
  categories: BlogCategory[];
}

export function NewPostForm({ author, categories }: NewPostFormProps) {
  const router = useRouter();

  const form = useForm<NewPostFormValues>({
    resolver: zodResolver(newPostSchema),
    defaultValues: {
      title: "",
      description: "",
      publishedAt: new Date(),
      categoryIds: [],
      tags: [],
      heroImage: "",
      content: "",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: NewPostFormValues) => {
    // Mock save — replace with real API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    console.info("Nuevo artículo:", { ...data, author });

    toast.success("Artículo creado", {
      description: `"${data.title}" fue guardado como borrador.`,
    });

    router.push(getChurchRoutePath("blog"));
  };

  const handleBack = () => router.push(getChurchRoutePath("blog"));

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate={true}>
        {/* ── Page header ─────────────────────────────────────────── */}
        <div className={newPostFormContentPage.header}>
          <div className="flex items-center gap-3 min-w-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={handleBack}
              aria-label="Volver al blog"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="size-5 text-muted-foreground shrink-0" />
              <h1 className="text-lg font-semibold truncate">Nuevo artículo</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" variant="outline" onClick={handleBack}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Send className="size-4 mr-2" />
              {isSubmitting ? "Publicando..." : "Publicar artículo"}
            </Button>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* ── Two-column layout ────────────────────────────────────── */}
        <div className={newPostFormContentPage.layout}>
          {/* ── Main column: content ─────────────────────────────── */}
          <div className="space-y-6">
            <TitleField control={control} />
            <DescriptionField control={control} />
            <ContentEditorField control={control} />
          </div>

          {/* ── Sidebar: metadata ────────────────────────────────── */}
          <aside className="space-y-6 lg:sticky lg:top-6">
            <HeroImageUploadField control={control} />

            <Separator />

            <AuthorDisplay author={author} />

            <PublicationDateField control={control} />

            <Separator />

            <CategoryField control={control} categories={categories} />

            <TagsField control={control} />
          </aside>
        </div>
      </form>
    </Form>
  );
}
