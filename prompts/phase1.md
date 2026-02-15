# Antigravity Prompt - Phase 1 (Foundation)

Build Phase 1 for AI Shift Planner V2.

## First action
Read these files in order and follow precedence exactly:
1. `prd/AI_Shift_Planner_Handoff_Index.md`
2. `prd/AI_Shift_Planner_PRD_v10_FINAL.md`
3. `prd/AI_Shift_Planner_Implementation_Spec_v1.md`
4. `prd/AI_Shift_Planner_RLS_Policies.sql`
5. `prd/AI_Shift_Planner_Acceptance_Test_Spec_v1.md`

## Scope for this phase
- Project scaffolding: Next.js + TypeScript + Tailwind + Supabase client setup
- Auth flows: manager/staff login, signup, session handling
- Database: apply migrations 001-016 exactly
- RLS: apply policies and verify manager/staff access separation
- Onboarding wizard: Step 1-7 with persistence
- Core CRUD only:
  - shops
  - staff
  - staff_availability
  - shift_periods
  - staffing_rules
  - important_dates
  - schedules (draft creation)

## Explicitly out of scope for Phase 1
- Claude integration
- AI schedule generation
- validator enforcement logic beyond basic placeholders
- publish/lock workflow
- drag-and-drop optimization

## Constraints
- No old Express/SQLite code reuse.
- No mock backend for production paths.
- No hardcoded local API base URLs.

## Deliverables
1. Working app bootstrapped and runnable locally
2. Migration and RLS setup instructions in README
3. Onboarding flow fully saves data
4. Basic manager/staff route protection
5. Phase 1 test evidence mapped to acceptance spec

## Final response format
Return:
1. Summary of what was built
2. Exact files changed
3. Commands run
4. Test results (pass/fail)
5. Remaining gaps before Phase 2
