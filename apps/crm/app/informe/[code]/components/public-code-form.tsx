"use client";

import { ArrowUpRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PublicButton } from "./public-actions";

const publicCodeFormInformePage = {
  form: cn("flex w-full flex-col gap-2.5"),
  control: cn(
    "flex min-h-12 items-center gap-2.5 rounded-lg bg-card px-4 text-sm",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)] transition-shadow",
    "focus-within:shadow-[inset_0_0_0_1.5px_var(--granada),0_0_0_4px_var(--granada-100)]",
  ),
  icon: cn("size-[17px] shrink-0 text-[var(--tinta-apagada)]"),
  input: cn(
    "min-w-0 flex-1 bg-transparent uppercase outline-none placeholder:text-[var(--tinta-apagada)]",
  ),
};

export function PublicCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const normalized = code.trim();
    if (normalized) {
      router.push(`/informe/${encodeURIComponent(normalized)}`);
    }
  }

  return (
    <form className={publicCodeFormInformePage.form} onSubmit={handleSubmit}>
      <label className={publicCodeFormInformePage.control}>
        <Search aria-hidden="true" className={publicCodeFormInformePage.icon} />
        <input
          aria-label="Código del informe"
          autoComplete="off"
          className={publicCodeFormInformePage.input}
          onChange={(event) => setCode(event.target.value)}
          placeholder="ASM-XXXXXX"
          value={code}
        />
      </label>
      <PublicButton type="submit" variant="primary">
        <ArrowUpRight aria-hidden="true" className="size-[18px]" />
        Abrir informe
      </PublicButton>
    </form>
  );
}
