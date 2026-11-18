# Tailwind style convention (CRM)

Class strings do not live inline in JSX. Each component declares one object named `<component><Section>Page` with a key per element, every value wrapped in `cn()`, and the root key receives the `className` prop:

```tsx
export function MinistryCard({ ministry, className }: MinistryCardProps) {
  const ministryCardMinistriesPage = {
    container: cn("flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-5", className),
    name: cn("font-display text-lg font-medium"),
  };

  return (
    <article className={ministryCardMinistriesPage.container}>
      <h3 className={ministryCardMinistriesPage.name}>{ministry.name}</h3>
    </article>
  );
}
```

- Static variants (status maps) stay as a module-level `satisfies Record<...>` constant and are merged into the object inside the component.
- Pages without a `className` prop declare the object at module level.
- shadcn primitives in `components/ui/` keep their own `cva` styles and are not rewritten by hand.

## Applied so far
`ministries`, `inventory`, `assembly` (all files), the whole Resumen dashboard (`dashboard/_components`) and Movimientos (page, filters, table, create dialog). The rest of the CRM (about 80 files with long inline classes) is migrated section by section.

The rule is also written in the repo `CLAUDE.md` (section 4, point 8) so new code follows it by default. Theme tokens `tinta-suave` and `tinta-apagada` are now exposed as Tailwind colors.
