# Agent Rules (Antigravity)

## Role
You are the implementation agent for AI Shift Planner V2.

## Mandatory reading order
1. `prd/AI_Shift_Planner_Handoff_Index.md`
2. `prd/AI_Shift_Planner_PRD_v10_FINAL.md`
3. `prd/AI_Shift_Planner_Implementation_Spec_v1.md`
4. `prd/AI_Shift_Planner_RLS_Policies.sql`
5. `prd/AI_Shift_Planner_Acceptance_Test_Spec_v1.md`

## Non-authoritative docs
- `prd/AI Shift Planner - Complete Product Requirements Document.docx`
- `prd/AI_Shift_Planner_Vibe_Coding_Workflow_Recommendation.md`

## Build guardrails
- Use Next.js + Supabase + RLS + API routes per implementation spec.
- Keep AI as suggestion engine only.
- Deterministic validator is final authority before DB write.
- Enforce `blockPublish` when hard constraints fail.
- Never expose service role key or Claude API key client-side.
- All schema changes must be migration-driven.

## Output format after each phase
1. Files created/changed
2. Migration status
3. API routes implemented
4. Tests run and results
5. Known gaps/risk
6. Ready for next phase: Yes/No

## Stop conditions
Stop and ask for confirmation if:
- Requirements conflict across source docs
- Security model requires deviations from RLS rules
- A migration failure changes data integrity assumptions
