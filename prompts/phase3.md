# Antigravity Prompt - Phase 3 (Hardening and Release)

Build Phase 3 for AI Shift Planner V2.

## First action
Re-check acceptance test spec and map all unfinished items.

## Scope for this phase
- Fix remaining defects and schema drift
- Add missing unit/integration/E2E tests
- Improve UX reliability:
  - warnings visibility
  - publish modal clarity
  - loading and error handling
- Remove dead code and mock paths
- Improve logging/audit reliability
- Production readiness checklist and runbook

## Quality gates (must pass)
- All P0 acceptance items: pass
- All P1 acceptance items: pass
- Lint/typecheck/test suite: pass
- Security check: no secret leakage client-side
- Migration replay on clean DB: pass

## Deliverables
1. Release candidate build
2. Full acceptance checklist with evidence
3. Deployment checklist for Vercel + Supabase
4. Post-MVP backlog captured clearly

## Final response format
Return:
1. Release readiness verdict
2. Open risks (if any)
3. Final checklist with pass/fail per item
4. Go-live recommendation: Yes/No
