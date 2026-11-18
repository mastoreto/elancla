# CRM migration - Phase 11 (voting)

UI only, sample data.

## Done
- Voting detail, moderation, vote and results views share `VotingPageShell`, which now opens with `DashboardPageHeader` (title, summary, status badge, back action) like the other sections.
- Every voting component declares its styles in a `<component>VotingPage` object (the previous generic `styles` objects were renamed) and the remaining inline long classNames moved into them.

## Pending
- Per-board layout details of live moderation and the mobile vote screen.
