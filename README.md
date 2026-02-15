# AI Shift Planner V2

This repository is the clean rebuild of AI Shift Planner.

## Source of truth
Use these documents in strict order:
1. `prd/AI_Shift_Planner_Handoff_Index.md`
2. `prd/AI_Shift_Planner_PRD_v10_FINAL.md`
3. `prd/AI_Shift_Planner_Implementation_Spec_v1.md`
4. `prd/AI_Shift_Planner_RLS_Policies.sql`
5. `prd/AI_Shift_Planner_Acceptance_Test_Spec_v1.md`

## Build strategy
- Start from scratch for architecture and data model.
- Reuse old UI only as visual reference.
- Do not reuse old Express/SQLite backend logic.

## Phase plan
- Phase 1: Foundation (auth, schema, onboarding, CRUD)
- Phase 2: AI scheduling engine + deterministic validator + publish flow
- Phase 3: hardening (tests, UX polish, release gates)

## How to use with Antigravity
1. Paste `prompts/phase1.md` into Antigravity and complete Phase 1.
2. Validate against acceptance criteria before moving on.
3. Paste `prompts/phase2.md` and complete Phase 2.
4. Paste `prompts/phase3.md` for hardening and release readiness.

## Rule
No phase handoff if P0/P1 acceptance checks fail.
