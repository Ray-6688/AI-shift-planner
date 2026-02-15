# AI Shift Planner — Acceptance & Test Spec (v1)

Date: 2026-02-15
Owner: Ray Wei
Status: Draft for implementation handoff

Source documents:
- `AI_Shift_Planner_PRD_v10_FINAL.md`
- `AI_Shift_Planner_Implementation_Spec_v1.md`
- `AI_Shift_Planner_Vibe_Coding_Workflow_Recommendation.md`

## 1. Purpose
This document defines the Definition of Done (DoD), acceptance criteria, and test checklist required to ship MVP without ambiguity.

Release can proceed only when all P0 and P1 items pass.

## 2. Release Gates

| Priority | Gate | Required for release |
|---|---|---|
| P0 | All hard scheduling constraints enforced server-side | Yes |
| P0 | `blockPublish` prevents publishing invalid schedules | Yes |
| P0 | Auth + role access control (manager vs staff) working | Yes |
| P0 | Migrations and seed run successfully on clean DB | Yes |
| P1 | AI output parsing/mapping resilient (`staff_ids` and `staff_names`) | Yes |
| P1 | Closed-day handling and special-day rules correct | Yes |
| P1 | UI supports core manager flow end-to-end | Yes |
| P2 | Performance and UX polish targets | Target, not blocker |

## 3. Test Environments

| Env | Purpose | Required data |
|---|---|---|
| Local (`localhost:3000`) | Development and manual QA | PRD seed data loaded |
| Staging (Vercel preview + Supabase staging) | Final regression and UAT | Fresh migrations + seed |
| Production | Live use | Production config and secrets |

Required env vars:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLAUDE_API_KEY`
- `CLAUDE_MODEL`
- `NEXT_PUBLIC_APP_URL`

## 4. Phase-Based Definition of Done

## Phase 1 — Foundation

DoD:
- App boots, routes resolve, and auth redirects work.
- Manager and staff login flows are functional.
- Manager without shop is redirected to `/onboard`.
- Onboarding 7-step wizard persists each step.
- Staff, availability, important dates, and settings CRUD pages function.
- Schedule page renders 3-column layout with week navigation and existing assignments.

Acceptance checklist:
- [ ] F1-01 Register manager account, auto-login, redirect to `/onboard`.
- [ ] F1-02 Complete all 7 onboarding steps and verify DB writes.
- [ ] F1-03 Login as manager and access manager routes.
- [ ] F1-04 Login as staff and confirm manager routes are blocked.
- [ ] F1-05 Create/edit/deactivate staff member and confirm table updates.
- [ ] F1-06 Set availability for one staff member and verify persistence.
- [ ] F1-07 Add important date with `shop_closed` and `affects_staffing` flags.
- [ ] F1-08 Update shift periods and staffing rules in settings.

## Phase 2 — Core Logic

DoD:
- AI generation route works with prompt builder and retry behavior.
- AI response parser handles valid JSON and fenced JSON blocks.
- Name/ID mapping works with warning generation for unknown values.
- Validator enforces all hard constraints before DB write.
- Weekly and monthly cap logic is correct, including cross-month weeks.
- `blockPublish` is returned when missing/understaffed shifts exist.

Acceptance checklist:
- [ ] F2-01 `generate` route returns schema-compliant object with `assignments`, `warnings`, `summary`.
- [ ] F2-02 Response with `staff_ids` only is accepted.
- [ ] F2-03 Response with `staff_names` only is accepted and mapped.
- [ ] F2-04 Invalid IDs produce warning and name fallback runs when available.
- [ ] F2-05 Unknown names produce `unmatched_staff` warnings.
- [ ] F2-06 `important_dates` special-day gating uses `affects_staffing=true`, `shop_closed=false`, `type in ('busy_event','holiday')`.
- [ ] F2-07 `validateAssignments()` returns `{ valid, rejected, warnings, blockPublish }` and rejects hard-rule violations.
- [ ] F2-08 Required shift matrix detects omitted shifts (`missing_shift`) and sets `blockPublish=true`.

## Phase 3 — Polish & Test

DoD:
- Drag-and-drop works with optimistic update and rollback on rejection.
- Error/loading/empty states implemented across schedule flows.
- Staff portal views schedule and edits availability.
- Core unit/integration/E2E tests pass.

Acceptance checklist:
- [ ] F3-01 Drag valid assignment into a shift and confirm persistence.
- [ ] F3-02 Drag invalid assignment and confirm rollback + error toast.
- [ ] F3-03 AI generation button disabled during request; success/failure states shown.
- [ ] F3-04 Publish modal shows warnings and blocks when `blockPublish=true`.
- [ ] F3-05 Responsive behavior is usable on mobile width (<=390px) and desktop.

## Phase 4 — Deploy

DoD:
- Staging and production deploy successfully.
- Secrets configured and not exposed to client.
- Smoke tests pass in deployed environment.

Acceptance checklist:
- [ ] F4-01 Vercel deploy succeeds with no runtime startup errors.
- [ ] F4-02 Supabase policies restrict cross-shop data access.
- [ ] F4-03 Production smoke test: login, generate, publish, and staff read schedule.
- [ ] F4-04 Error logs and audit trail (`schedule_edits`) are present for publish flow.

## 5. Hard Constraint Test Matrix (P0)

| ID | Constraint | Test scenario | Expected result |
|---|---|---|---|
| HC-01 | Availability | Assign Sarah outside M/W/F 11:00–21:00 | Assignment rejected |
| HC-02 | Capability (Opening) | Assign Alex to Opening (no opening capability) | Assignment rejected |
| HC-03 | Weekly cap | Push Sarah above 20 weekly hours | Assignment rejected |
| HC-04 | Monthly cap | Push monthly-limited staff above monthly cap | Assignment rejected |
| HC-05 | Cross-month monthly logic | Week spans Jan/Feb; verify monthly checks per shift month | Correct month-specific enforcement |
| HC-06 | Trainee pairing | Assign only trainee(s) to a shift | Assignment rejected |
| HC-07 | Closing skill | Evening shift without closer skill >= configured min | Assignment rejected |
| HC-08 | Minimum staffing | Shift assigned below staffing rule count | Warning critical + `blockPublish=true` |
| HC-09 | Missing shift detection | Omit all assignments for required shift/date combo | `missing_shift` warning + `blockPublish=true` |
| HC-10 | Closed day handling | `important_dates.shop_closed=true` or operating hours closed day | No required shift expected for that date |

## 6. Data Integrity & DB Acceptance

| ID | Check | Expected |
|---|---|---|
| DB-01 | Run migrations 001–015 on empty DB | Success with no duplicate-index failures |
| DB-02 | Run seed SQL after migrations | Success, all FK references valid |
| DB-03 | Duplicate shift insert test | Blocked by unique index `(schedule_id, shift_period_id, date, staff_id)` |
| DB-04 | `users` ↔ `staff` linkage | One-way linkage via `staff.user_id`, no circular key |
| DB-05 | `important_dates` uniqueness | Duplicate `(shop_id, date, name)` rejected |

## 7. API Contract Acceptance

| ID | Endpoint | Check | Expected |
|---|---|---|---|
| API-01 | `POST /api/schedules/generate` | Valid request returns parsed schedule | 200 + schema-compliant payload |
| API-02 | `POST /api/schedules/generate` | AI malformed JSON | Retry + fallback response with `ai_error` warning |
| API-03 | `POST /api/schedules/[id]/publish` | Invalid schedule | Publish blocked with reasons |
| API-04 | `POST /api/schedules/[id]/publish` | Valid schedule | Status -> `published`, `published_at` set |
| API-05 | `GET/POST /api/compliance/*` | Weekly/monthly calculations | Values match DB aggregates |
| API-06 | `POST /api/dates/import-holidays` | Import for date range | Rows inserted/upserted without duplicates |

## 8. UI/UX Acceptance

| ID | Flow | Expected |
|---|---|---|
| UX-01 | Generate button | Disabled while loading, progress visible |
| UX-02 | Warning visibility | All warnings visible in schedule UI and publish modal |
| UX-03 | Error fallback | Retry/manual options shown when AI fails |
| UX-04 | Hours tracker | Reflects post-assignment hours and near-limit state |
| UX-05 | Role-specific navigation | Manager and staff see correct nav/route access |

## 9. Security & Access Acceptance

| ID | Check | Expected |
|---|---|---|
| SEC-01 | Client bundle inspection | No service role key / Claude key exposed |
| SEC-02 | Staff accessing manager data | Denied by middleware/RLS |
| SEC-03 | Cross-shop data access attempt | Denied by RLS |
| SEC-04 | API routes requiring server credentials | Use server-side Supabase client only |

## 10. Performance Targets (MVP)

| Metric | Target |
|---|---|
| AI generation API p95 | <= 10s (acceptable <= 15s) |
| Publish API p95 | <= 3s |
| Schedule page initial render | <= 2.5s on staging data |
| Drag-drop validation feedback | <= 300ms perceived response |

## 11. Automated Test Minimums

Required before MVP release:
- Unit tests for validator hard constraints and utility functions.
- Integration tests for `generate` and `publish` API routes.
- At least one E2E happy path (manager login -> generate -> publish).

Suggested command contract:
```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 12. UAT Sign-off Template

| Area | Owner | Status | Notes |
|---|---|---|---|
| Product flow | PM | Pending/Pass/Fail | |
| Backend logic | Engineering | Pending/Pass/Fail | |
| AI behavior | PM + Engineering | Pending/Pass/Fail | |
| Security/RLS | Engineering | Pending/Pass/Fail | |
| Deployment | Engineering | Pending/Pass/Fail | |

Final release decision:
- [ ] Approved for MVP release
- [ ] Blocked (P0/P1 failures remain)

## 13. Known Deferred Items (Not MVP blockers)

- Shift swaps between staff
- Push/email/SMS notifications
- Split shift availability windows
- Immutable schedule versioning
- Opportunity-count redesign for `ai_patterns`

