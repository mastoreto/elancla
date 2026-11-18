# Fidelity F1 — Login and public report screens

Ported from the board code: `crm-s-login`, `crm-s-publico-informe`, `crm-s-publico-estados`, `crm-s-publico-cierre`.

- Login: two-column hero (gradient panel, offering and approvals cards) and a branded form with icons, custom checkbox and gradient submit.
- Public report (`/informe/[code]`), seven states: location request, out of range (map and distance), report visible, not yet available, closed, revoked and invalid code (with code input).
- The location gate uses `navigator.geolocation` against placeholder coordinates in `data/church-location.ts` (300 m radius). Nothing is stored.
- Tests: `utils/distance`, `utils/validity`.
- Shared tokens (`--grad-*`, `--canvas`) and the `BrandMark` glyph match F0; the hunks are identical so the PRs merge cleanly in any order.
- Radius note: in this theme `rounded-lg` is 16 px, `rounded-xl` 24 px and `rounded-2xl` 30 px; use arbitrary values for other sizes.
