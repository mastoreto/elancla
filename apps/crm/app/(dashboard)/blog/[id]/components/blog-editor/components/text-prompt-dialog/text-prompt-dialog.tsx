"use client";

import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardDialogContent } from "@/components/dashboard/board/board-dialog";
import { BoardInput } from "@/components/dashboard/board/board-form";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const textPromptDialogBlogPage = {
  body: cn("flex flex-col gap-4"),
  actions: cn("flex justify-end gap-2"),
};

interface TextPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  label: string;
  hint?: string;
  initialValue?: string;
  maxLength: number;
  /** When false an empty value is accepted (e.g. the optional author of a pullquote). */
  required?: boolean;
  submitLabel: string;
  onSubmit: (value: string) => void;
}

interface TextPromptFormProps extends Omit<TextPromptDialogProps, "open" | "onOpenChange"> {
  onClose: () => void;
}

function TextPromptForm({
  title,
  description,
  label,
  hint,
  initialValue = "",
  maxLength,
  required = true,
  submitLabel,
  onSubmit,
  onClose,
}: TextPromptFormProps) {
  const [value, setValue] = useState(initialValue);
  const trimmed = value.trim();
  const canSubmit = !required || trimmed !== "";

  function confirm(): void {
    if (!canSubmit) return;
    onSubmit(trimmed);
    onClose();
  }

  return (
    <BoardDialogContent description={description} title={title}>
      <div className={textPromptDialogBlogPage.body}>
        <BoardInput
          autoFocus={true}
          hint={hint}
          id="blog-text-prompt"
          label={label}
          maxLength={maxLength}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            // Not a <form>: a submit would bubble through the portal to the post form.
            if (event.key !== "Enter") return;
            event.preventDefault();
            confirm();
          }}
          value={value}
        />
        <div className={textPromptDialogBlogPage.actions}>
          <BoardButton onClick={onClose} variant="ghost">
            Cancelar
          </BoardButton>
          <BoardButton disabled={!canSubmit} onClick={confirm} variant="primary">
            {submitLabel}
          </BoardButton>
        </div>
      </div>
    </BoardDialogContent>
  );
}

/** A dialog with one text field; the content mounts per opening so it always starts fresh. */
export function TextPromptDialog({ open, onOpenChange, ...form }: TextPromptDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <TextPromptForm {...form} onClose={() => onOpenChange(false)} />
    </Dialog>
  );
}
