# Placement Cell (frontend)

React module for the placement cell, consuming the `placement_cell` API in the
Fusion backend. It renders a role-aware tabbed workspace for students, alumni,
the placement officer (TPO) and the placement chairman.

- **Stack:** React 18 + Vite, Mantine v7, Redux Toolkit, axios,
  `mantine-react-table`, `react-big-calendar`.
- **Entry:** routed at `/placement-cell/*` (see `src/routes/placementCellRoutes`).
  `pages/PlacementCellPage.jsx` picks the tab set from `state.user.role` and
  renders the shared `ModuleTabs` navbar.

## Tabs by role

| Role | Tabs |
|------|------|
| Student | Placement Schedule, Announcements, Placement Stats, My Applications, My Offers, Placement Appeals, Download CV, Placement Calendar, Alumni Network/Referrals/Mentorship |
| Officer (TPO) | Student CPI, Company Registration, Placement Schedule, Off-Campus Placements, Announcements, Placement Stats, Send Notifications, Reports, Debarred Students, Restrictions, Fields, Placement Appeals, Higher Studies, Placement Calendar, Alumni (request/verification/referrals) |
| Chairman | Student CPI, Placement Stats, Off-Campus Placements, Announcements, Placement Schedule, Reports, Policies, Placement Appeals, Debarred Students, Higher Studies, Alumni Verification, Placement Calendar |
| Alumni | Alumni Profile, Job Referrals, Mentorship Sessions, Student Network |

## Key UI behaviour

- **Placement Schedule** — Agenda (Today / This Week / Upcoming / Closed) with a
  toggle to the filterable card view; eligibility and deadline badges.
- **Placement Calendar** — colour-coded by type (Drive / Test / Interview /
  Deadline / Event) with a legend. TPO/chairman can click a date or slot to add
  an event and edit/delete their events; students see it read-only.
- **Add Placement Event** — branches come from the backend (`/branches/`),
  application fields can be created inline, and active institute-wide
  restrictions are shown read-only so nothing is missed.
- **Student CPI** — pick a batch with published results to view/export CPI.
- Date inputs use native `datetime-local` / `date` controls.

## Performance

Every tab is **lazy-loaded** behind a `Suspense` boundary, so opening the module
loads only the shell plus the active tab. `vite.config.js` `manualChunks` splits
heavy vendors (`react-big-calendar`, `mantine-react-table`, `@mantine`, react,
pdf libs) into separate cacheable chunks. Prefer `npm run build && npm run
preview` to gauge real (production) load time rather than the dev server.

## Code map

- `api.js` — `placementApi` (one method per endpoint) + `buildAuthConfig()`.
- `services/api.js` — re-exports `placementApi`.
- `components/common` — schedule, agenda, calendar, CV, spinner.
- `components/forms` — add/edit drive, company/alumni registration, fields,
  notifications, apply.
- `components/tables` — CPI, off-campus, announcements, debarred, restrictions,
  records, reports, appeals, alumni, higher studies.
- `utils/authorization.js` — role lists + `showApiError` / 403 handling.

## Tests

```bash
npm test        # vitest (api contract, helpers, authorization, components)
npm run lint
```
