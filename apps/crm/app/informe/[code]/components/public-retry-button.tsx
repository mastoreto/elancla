"use client";

import { RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { PublicButton } from "./public-actions";

interface PublicRetryButtonProps {
  label?: string;
}

export function PublicRetryButton({ label = "Volver a intentar" }: PublicRetryButtonProps) {
  const router = useRouter();

  return (
    <PublicButton onClick={() => router.refresh()}>
      <RotateCw aria-hidden="true" className="size-4" />
      {label}
    </PublicButton>
  );
}
