# CRM migration - Phase 2 (design tokens and base components)

Source: design artifact "Sistemas de diseño El Ancla", boards `crm-fundamentos` and `crm-tokens` (iEkklesia system v3, "Santidad").

## What changed
- `app/globals.css`: brand tokens (lino, bruma, tinta, granada, oro, vino, vida), radii `--r-xs..--r-2xl`, elevation `--sombra` / `--sombra-flotante`, motion `--ease` and `--t-1..3`. The shadcn semantic tokens (`--primary`, `--background`, `--ring`, `--sidebar`, charts, income/expense) now map onto them, in light and dark. The old `--dashboard-*` variables were removed.
- Tailwind theme: brand colors as utilities (`bg-granada`, `text-oro-texto`, ...), radius scale `rounded-sm..3xl` mapped to the design radii, `shadow-card` and `shadow-float`, default transition 150 ms with the design curve.
- Fonts: Outfit (display, `--font-heading`) and Plus Jakarta Sans (UI, `--font-ui`) replace Fraunces and Libre Franklin. Headings `h1`-`h3` use the display font.
- Accessibility: global `:focus-visible` ring of 3 px light granada with 2 px offset, `prefers-reduced-motion` support, 44 px touch targets for default and large buttons below the `md` breakpoint.
- Components: card uses the 24 px radius and `shadow-card`; button hover uses `granada-fuerte`; sidebar uses semantic sidebar tokens; every `var(--dashboard-*)` usage was replaced by the new tokens.

## Contrast (computed against the artifact)
tinta on lino 16.7:1, white on granada 5.2:1, tinta-suave on bruma 7.7:1, tinta-apagada on white 5.5:1, granada-fuerte on white 6.8:1.

## Notes
- The artifact defines no dark mode; the dark values are derived from vino and keep the same hues. Review them with the design owner.
- `tinta-suave` (#58454a) and `tinta-apagada` (#76656a) are not named in the artifact; they were calculated to match its published contrast ratios.
- Layout shell, navigation, form, data, overlay and feedback component details (`crm-navegacion`, `crm-formularios`, `crm-datos`, `crm-overlays`, `crm-feedback`) are applied page by page in Phase 3.
