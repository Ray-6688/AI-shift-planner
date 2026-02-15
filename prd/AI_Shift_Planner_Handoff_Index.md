# AI Shift Planner — AI Developer Handoff Index (Canonical Source of Truth)

Date: 2026-02-15
Owner: Ray Wei
Status: Active

## 1. Purpose
This file defines exactly which documents are authoritative for AI-assisted implementation and how to resolve conflicts between them.

## 2. Authoritative Documents (in precedence order)
1. `AI_Shift_Planner_Handoff_Index.md` (this file)
2. `AI_Shift_Planner_PRD_v10_FINAL.md`
3. `AI_Shift_Planner_Implementation_Spec_v1.md`
4. `AI_Shift_Planner_RLS_Policies.sql`
5. `prd/AI_Shift_Planner_Seed_Data.sql`
6. `AI_Shift_Planner_Acceptance_Test_Spec_v1.md`

If two documents conflict, use the higher-precedence document.

## 3. Non-Authoritative / Reference-Only Documents
- `AI Shift Planner - Complete Product Requirements Document.docx`
  - Legacy reference only; do not use as implementation source.
- `AI_Shift_Planner_Vibe_Coding_Workflow_Recommendation.md`
  - Tool/process guidance only; not product/architecture truth.

## 4. Conflict Resolution Rules

### Rule A: Stack & architecture
- Source of truth: `AI_Shift_Planner_Implementation_Spec_v1.md`
- Required stack: Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui, Supabase, Claude API.
- **Supabase Override**: Use Supabase Auth & Client for CRUD/Auth instead of Express/JWT. See Implementation Spec v1.
- Do not implement an Express server architecture unless explicitly requested later.

### Rule B: Product behavior and constraints
- Source of truth: `AI_Shift_Planner_PRD_v10_FINAL.md`
- Hard scheduling constraints and validator behavior must match PRD v10 exactly.
- `blockPublish` behavior is mandatory.

### Rule C: Access control
- Source of truth: `AI_Shift_Planner_RLS_Policies.sql`
- RLS + role gating are mandatory for MVP release.

### Rule D: Release readiness
- Source of truth: `AI_Shift_Planner_Acceptance_Test_Spec_v1.md`
- P0 and P1 gates must pass before release.

## 5. Implementation Guardrails (Must Follow)
- Keep AI as a suggestion engine only; deterministic server-side validator is final authority.
- Accept AI payloads with `staff_ids` or `staff_names`; map and warn on unknown values.
- Enforce weekly/monthly caps per PRD logic (including cross-month behavior).
- Enforce special-day gating with `affects_staffing`, `shop_closed`, and `type` rules.
- Enforce missing-shift detection across full required shift matrix.
- Preserve unique shift-assignment constraint.

## 6. Out of Scope (MVP)
- Shift swaps
- Push/email/SMS notifications
- Split availability windows per day
- Immutable schedule versioning
- Native mobile app

## 7. Required Artifacts Before MVP Sign-off
- Migrations applied (001–015) with no duplicate-index failures
- Seed data applied successfully (`prd/AI_Shift_Planner_Seed_Data.sql`)
- RLS policies applied successfully
- Acceptance tests (P0/P1) passing
- End-to-end manager flow: onboard -> generate -> validate -> publish

## 8. Quick Start for AI Developer
1. Read this index first.
2. Implement schema and core logic from `AI_Shift_Planner_PRD_v10_FINAL.md`.
3. Apply architecture constraints from `AI_Shift_Planner_Implementation_Spec_v1.md`.
4. Apply `AI_Shift_Planner_RLS_Policies.sql` in Supabase SQL editor.
5. Validate implementation using `AI_Shift_Planner_Acceptance_Test_Spec_v1.md`.

