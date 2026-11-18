# Fidelity F5 — Voting

Ports the six voting screens to the `crm-s-votaciones-*` boards: list, overview, moderator, results, create and the phone-style vote mock.

- Seeds replaced with four board-based votings (open, draft, two closed).
- `utils/voting-view.ts` holds the pure view helpers (tested).
- Local components: status pill, option bars, quorum segments, donut, majority toggle.
- Removed `voting-page-shell`, `voting-metric-card`, `voting-status-badge`.
- Shared primitives under `components/dashboard/board/` are identical across phase branches.
- Board data quirks: closed-vote totals are computed from the seeds, not hard-coded.
