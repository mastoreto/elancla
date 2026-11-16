import type * as React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface ActionButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}

export function ActionButton({ label, onClick, className, children }: ActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild={true}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClick}
          className={cn("size-8 p-0 text-muted-foreground hover:text-foreground", className)}
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
