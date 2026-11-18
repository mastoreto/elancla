"use client";

import { format } from "date-fns";
import {
  Download,
  Eye,
  FileText,
  Image,
  Link2,
  MoreHorizontal,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectDocument } from "@/lib/types";
import { cn } from "@/lib/utils";

const projectDocumentsProjectsPage = {
  empty: cn(
    "rounded-xl border border-dashed border-border/50 bg-card p-12 flex flex-col items-center justify-center text-center",
  ),
  emptyIcon: cn("size-12 rounded-full bg-muted flex items-center justify-center mb-4"),
  emptyText: cn("text-sm text-muted-foreground max-w-[250px] mb-4"),
  item: cn(
    "flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors group",
  ),
  itemActions: cn("flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"),
};

interface ProjectDocumentsProps {
  documents: ProjectDocument[];
  canEdit?: boolean;
}

const typeIcons = {
  pdf: FileText,
  image: Image,
  link: Link2,
};

const typeColors = {
  pdf: "text-expense bg-accent",
  image: "text-secondary-foreground bg-secondary",
  link: "text-accent bg-accent/10",
};

export function ProjectDocuments({ documents, canEdit = false }: ProjectDocumentsProps) {
  if (documents.length === 0) {
    return (
      <div className={projectDocumentsProjectsPage.empty}>
        <div className={projectDocumentsProjectsPage.emptyIcon}>
          <FileText className="size-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">Sin documentos</h3>
        <p className={projectDocumentsProjectsPage.emptyText}>
          Carga documentos para mantener todo organizado
        </p>
        {canEdit && (
          <Button variant="outline">
            <Upload className="mr-2 size-4" />
            Cargar Documento
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <Button variant="outline">
            <Upload className="mr-2 size-4" />
            Upload Document
          </Button>
        </div>
      )}

      <div className="grid gap-3">
        {documents.map((doc) => {
          const Icon = typeIcons[doc.type];
          const colorClass = typeColors[doc.type];

          return (
            <div key={doc.id} className={projectDocumentsProjectsPage.item}>
              <div className={`size-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                <Icon className="size-5" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{doc.name}</p>
                <p className="text-sm text-muted-foreground">
                  Uploaded by {doc.uploadedBy} on {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                </p>
              </div>

              <div className={projectDocumentsProjectsPage.itemActions}>
                {doc.type !== "link" && (
                  <Button variant="ghost" size="icon">
                    <Download className="size-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon">
                  <Eye className="size-4" />
                </Button>
                {canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild={true}>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
