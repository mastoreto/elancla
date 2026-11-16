"use client";

import { User } from "lucide-react";
import type { BlogAuthor } from "@/app/(dashboard)/blog/types";

interface AuthorDisplayProps {
  author: BlogAuthor;
}

export function AuthorDisplay({ author }: AuthorDisplayProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium leading-none">Autor</p>
      <div className="flex items-center gap-2 rounded-lg border border-input bg-muted/30 px-3 py-2">
        <div className="flex size-7 items-center justify-center rounded-full bg-accent text-accent-foreground shrink-0">
          <User className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{author.name}</p>
          <p className="text-xs text-muted-foreground">Sesión actual</p>
        </div>
      </div>
    </div>
  );
}
