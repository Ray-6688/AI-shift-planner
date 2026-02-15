# Antigravity Prompt - Phase 2 (AI Scheduling Core)

Build Phase 2 for AI Shift Planner V2.

## First action
Re-read source docs in precedence order from the handoff index.

## Scope for this phase
- Implement `services/ai` behavior per PRD v10
- Implement deterministic `services/validator` per PRD v10
- Add API routes for:
  - generate schedule
  - validate assignments
  - publish schedule
- Enforce hard constraints server-side before DB write
- Implement `blockPublish` behavior
- Support AI payload with `staff_ids` OR `staff_names`
- Handle special days and closed days correctly
- Persist schedule edits audit trail
- Update AI patterns on publish

## Required hard checks
- Cross-month monthly limit handling
- Missing shift detection via full week shift matrix
- Trainee pairing rules
- Closing skill requirements
- Staffing minimums
- Unique shift assignment protection

## Out of scope for Phase 2
- Advanced UI polish
- exports/reporting enhancements
- notification channels

## Deliverables
1. End-to-end manager flow: onboard -> generate -> validate -> publish
2. Critical warnings visible and consistent
3. Publish blocked on hard constraint violations
4. API and validator tests for P0/P1 coverage

## Final response format
Return:
1. Summary of implemented backend + UI wiring
2. Files changed
3. Test matrix results against acceptance spec
4. Known edge cases and mitigation
5. Ready/Not ready for Phase 3
