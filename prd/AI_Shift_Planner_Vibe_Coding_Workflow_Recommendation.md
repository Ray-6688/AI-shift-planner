# AI Shift Planner — Vibe Coding Tool Assessment & Workflow Recommendation

> **For:** Ray (PM learning to build AI products)
> **Date:** 2026-02-15
> **App:** AI Shift Planner for Sober Boba (Next.js + Supabase + Claude API)

---

## Part 1: App Complexity Assessment

### Your App vs. Typical Vibe Coding Projects

| Complexity Factor | Your App | Typical Vibe Coding App | Verdict |
|---|---|---|---|
| Database tables | 14 tables with FK relationships | 3-5 tables | **High** |
| Auth & roles | Manager + Staff with different views | Single role | **Medium-High** |
| Pages/screens | 12+ pages (manager + staff portal) | 4-6 pages | **High** |
| Onboarding wizard | 7-step wizard with per-step DB saves | Simple form | **Medium** |
| AI integration | Claude API with custom prompt + validator | None or basic | **High** |
| Drag-and-drop | Full schedule grid (dnd-kit) | None | **High** |
| Business logic | 6 hard constraints, hour tracking, compliance | Basic CRUD | **Very High** |
| Real-time validation | Drop-time constraint checking | None | **High** |

### Complexity Rating: 8/10

This is significantly more complex than what most vibe coding tools can handle in one shot. For reference:
- **Simple app** (3/10): Landing page, contact form, basic CRUD — any tool handles this
- **Medium app** (5/10): Multi-page dashboard, auth, database — Lovable/Antigravity sweet spot
- **Your app** (8/10): Multi-role auth, complex UI (drag-drop), AI integration, compliance logic, 14-table DB
- **Enterprise app** (10/10): Multi-tenant, real-time collaboration, offline support

**Key insight:** No single vibe coding tool will build this entire app in one session. You need a phased approach with the right tool for each phase.

---

## Part 2: Your Tools — Honest Assessment

### Tool Capability Matrix for YOUR App

| Tool | Best For | Handles Your App? | Cost | Learning Value |
|---|---|---|---|---|
| **Google Antigravity** | Full-stack greenfield apps, parallel agents | 70% of it (struggles with drag-drop, complex validation) | Free (preview) | High — closest to real dev |
| **Claude Code** | Complex logic, debugging, multi-file refactoring | Best for AI service + validator + backend logic | Limited tokens | Highest — teaches real coding |
| **Codex** | Well-scoped tasks, tests, refactoring, PRs | Good for specific features, not full scaffolding | $20/mo (Plus) | Medium |
| **Lovable** | UI prototyping, beautiful frontends fast | Good for initial UI + pages, breaks on complex logic | Credits-based | Low — abstracts too much |
| **Aura.build** | Landing pages, design mockups | **NOT suitable** — landing page tool, not app builder | $16/mo | None for this project |
| **Manus** | Research, planning, content generation | Already used (PRDs). Not reliable for coding. | Credits burn fast | Good for research only |

### Tool-by-Tool Deep Dive

**Google Antigravity** (PRIMARY TOOL)
- 2M token context window (can read entire codebase)
- Supabase MCP integration (create tables, manage auth from IDE)
- Free during preview with generous weekly limits
- Best for: scaffolding entire Next.js app, creating pages, wiring Supabase
- Weakness: may struggle with dnd-kit integration and complex validator logic
- Sources: [Google Developers Blog](https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/), [Antigravity + Supabase MCP](https://lilys.ai/en/notes/openai-agent-builder-20260208/antigravity-supabase-mcp-build-app)

**Claude Code** (PRECISION TOOL)
- Best reasoning for complex business logic
- Excellent at multi-file refactoring and debugging
- Limited tokens = use strategically, not for scaffolding
- Best for: AI prompt service, validator, schedule store, fixing Antigravity bugs
- Sources: [Claude Code Full-Stack Essentials](https://wasp.sh/blog/2026/01/29/claude-code-fullstack-development-essentials)

**Codex** (PARALLEL WORKER)
- Runs tasks in cloud sandboxes, parallel execution
- Good for: writing tests, fixing specific bugs, code review
- Included in ChatGPT Plus ($20/mo)
- Internet disabled during execution — can't test Supabase/API connections in real-time
- Sources: [OpenAI Codex](https://openai.com/codex/), [Codex Review](https://aitoolanalysis.com/chatgpt-codex-review/)

**Lovable** (UI BOOTSTRAPPER — OPTIONAL)
- Generates beautiful React + Supabase apps from descriptions
- Has native Supabase integration
- Exports clean code to continue in other tools
- Breaks on complex features (known "looping" bug problem)
- **Generates Vite + React, NOT Next.js** — would need restructuring
- Sources: [Lovable vs Bolt Comparison](https://www.nocode.mba/articles/bolt-vs-lovable), [Export Guide](https://www.braingrid.ai/blog/how-to-download-lovable-project)

**Aura.build** (SKIP FOR THIS PROJECT)
- Landing page and design generator, not an app builder
- Cannot handle auth, database, API routes, or complex state
- Useful if you later need a marketing site for the shift planner product
- Sources: [Aura Reviews](https://www.trustpilot.com/review/aura.build)

**Manus** (RESEARCH ONLY)
- Already served its purpose (helped create PRDs)
- Credits burn too fast for coding (500-900 credits per complex task)
- Stops completely if credits deplete mid-task — incomplete output, credits gone
- Sources: [Manus Pricing](https://manus.im/docs/introduction/plans), [Manus Review](https://cybernews.com/ai-tools/manus-ai-review/)

---

## Part 3: Recommended Workflow

### The "Graduated Complexity" Approach

The proven pattern from successful vibe coders: **Scaffold fast with Antigravity → Add complex logic with Claude Code → Polish and test → Deploy**

```
Phase 1: Foundation (Antigravity)     → Get the app running end-to-end
Phase 2: Core Logic (Claude Code)     → Add the hard parts AI tools struggle with
Phase 3: Polish & Test (Antigravity)  → Complete all screens, fix bugs
Phase 4: Deploy (Antigravity/Vercel)  → Ship it
```

---

### Phase 1: Foundation — Google Antigravity (Week 1-3)
**Goal:** Working app skeleton with auth, database, and basic pages

**Setup (Day 1):**
1. Create new Next.js project in Antigravity
2. Connect Supabase MCP (Antigravity has built-in support)
3. Feed all 3 PRD files as context
4. Run bootstrap commands from Implementation Spec

**Build in this order:**

| Step | What | Antigravity Prompt Strategy | Days |
|------|------|----------------------------|------|
| 1.1 | Supabase tables | Use Supabase MCP to create all 14 tables from PRD SQL | 1 |
| 1.2 | Auth (register/login) | "Create auth pages using Supabase Auth with email/password, manager/staff roles" | 1 |
| 1.3 | Onboarding wizard | Build step by step, one prompt per step | 2-3 |
| 1.4 | Staff management page | "Create /staff page with table, add/edit modal" — standard CRUD | 1-2 |
| 1.5 | Availability page | "Create /availability page with day/time grid" | 1 |
| 1.6 | Important dates page | "Create /dates page with calendar view, import Denmark holidays button" | 1 |
| 1.7 | Settings page | "Create /settings page with shop info, shift periods, staffing rules tabs" | 1 |
| 1.8 | Basic schedule page | Layout only (3-column), no drag-drop yet. Just display shifts in a grid. | 1-2 |

**Why Antigravity first:**
- Free, generous limits, 2M context window
- Supabase MCP handles DB setup directly
- Best for scaffolding many pages quickly
- Parallel agents can build multiple pages simultaneously

**Learning tip:** After each prompt, read the generated code. Ask Antigravity: "Explain what this code does and why you structured it this way."

---

### Phase 2: Core Logic — Claude Code (Week 4-6)
**Goal:** Add the complex features Antigravity would struggle with

**Why Claude Code here:** These features require precise business logic, multi-file coordination, and careful reasoning. Use tokens strategically.

| Step | What | Why Claude Code | Complexity |
|------|------|-----------------|------------|
| 2.1 | AI schedule generation service | Complex prompt template + Claude API call + retry logic + JSON parsing. Adapt PRD's `services/ai.js` to Next.js API route. | High |
| 2.2 | Server-side validator | 6 hard constraints + `blockPublish` flag. Adapt PRD's `services/validator.js`. Most critical business logic. | High |
| 2.3 | Schedule Zustand store | Optimistic updates, drag-drop state, undo. Complex state management. | Medium-High |
| 2.4 | Drag-and-drop integration | Wire dnd-kit into schedule grid. Connect to validator for real-time constraint checking. | High |
| 2.5 | Publish flow | Validate → lock schedule → update AI patterns → notify. Multi-step with error handling. | Medium |
| 2.6 | Compliance calculations | Weekly/monthly hour aggregation per staff, cross-month boundary handling. | Medium |

**Token-saving strategy:**
- Do research/exploration in Antigravity (free)
- Come to Claude Code with specific, well-scoped tasks
- Paste the relevant PRD code and say "Convert this to Next.js TypeScript for my Supabase setup"
- Don't use Claude Code for creating new pages or basic UI

---

### Phase 3: Polish — Google Antigravity + Codex (Week 7-9)
**Goal:** Complete remaining screens, fix bugs, improve UX

| Step | Tool | What |
|------|------|------|
| 3.1 | Antigravity | Dashboard page (widgets, compliance alerts, recent edits) |
| 3.2 | Antigravity | Compliance page (tables, progress bars, export buttons) |
| 3.3 | Antigravity | Staff portal (login, read-only schedule, availability edit) |
| 3.4 | Codex | Write tests for validator and AI service (parallel cloud tasks) |
| 3.5 | Antigravity | Loading states, error states, empty states, responsive tweaks |
| 3.6 | Claude Code | Debug any complex issues Antigravity can't resolve |

**Why Codex here:** Writing tests is a well-scoped, parallelizable task — exactly what Codex excels at. Run multiple test-writing tasks simultaneously in cloud sandboxes.

---

### Phase 4: Deploy — Antigravity + Vercel (Week 10)
**Goal:** Ship to production

| Step | Tool | What |
|------|------|------|
| 4.1 | Antigravity | Environment variable setup, production config |
| 4.2 | Antigravity | Connect GitHub repo, push code |
| 4.3 | Vercel | Deploy from GitHub (automatic with Next.js) |
| 4.4 | Supabase | Set up production project, run migrations |
| 4.5 | Claude Code | Security review of auth, RLS policies, API routes |

---

## Part 4: Tool Allocation Summary

### Work Split by Tool

```
Google Antigravity  ████████████████████░░░░░  60% — Scaffolding, pages, UI, deployment
Claude Code         ████████░░░░░░░░░░░░░░░░  25% — Complex logic, AI service, debugging
Codex               ███░░░░░░░░░░░░░░░░░░░░░  10% — Tests, well-scoped tasks
Lovable             ░░░░░░░░░░░░░░░░░░░░░░░░   0% — Skip (Antigravity covers this better)
Aura.build          ░░░░░░░░░░░░░░░░░░░░░░░░   0% — Not an app builder
Manus               █░░░░░░░░░░░░░░░░░░░░░░░   5% — Research only (PRDs already done)
```

### Why NOT Lovable?

1. **Lovable generates Vite + React**, not Next.js App Router. You'd need to restructure everything after export.
2. **Antigravity generates Next.js natively** with your exact stack.
3. **Lovable's Supabase integration** creates its own schema patterns. Your PRD has 14 precisely-defined tables — you want those used exactly.
4. **The "looping" problem** — Lovable is known to break on complex features, burning credits without resolving issues.
5. **No learning value** — Lovable abstracts everything. You want to learn how the code works.

### Cost Estimate

| Tool | Monthly Cost | Duration | Total |
|------|-------------|----------|-------|
| Google Antigravity | $0 (free preview) | 10 weeks | $0 |
| Claude Code | Already subscribed (limited) | Strategic use | $0 (existing) |
| Codex (ChatGPT Plus) | $20/mo | 2-3 months | $40-60 |
| Supabase | $0 (free tier) | Ongoing | $0 |
| Vercel | $0 (hobby plan) | Ongoing | $0 |
| **Total** | | | **$40-60** |

---

## Part 5: Daily Workflow Pattern

### How a Typical Development Session Looks (30-60 min)

```
1. Open Antigravity → your project
2. Check what you built yesterday (review code, test it)
3. Pick next feature from the phase checklist
4. Prompt Antigravity to build it
5. Test in browser (localhost:3000)
6. If it works → commit → move to next feature
7. If it breaks on complex logic → note the issue
8. Open Claude Code → paste the specific broken code → fix it
9. Copy fix back to Antigravity project
10. Commit → done for the day
```

### The "Handoff" Pattern Between Tools

```
Antigravity creates the file/page structure  →
Claude Code writes the complex logic inside those files  →
Antigravity wires everything together and adds UI polish  →
Codex writes tests in parallel
```

**Key rule:** Never have two tools working on the same file simultaneously. Clear ownership per file prevents conflicts.

---

## Part 6: Learning Strategy

### What You'll Learn from Each Tool

| Tool | What You'll Learn | PM-Relevant Skill |
|------|-------------------|-------------------|
| **Antigravity** | How full-stack apps are structured, file-based routing, component composition | System design, feature scoping |
| **Claude Code** | How business logic works in code, debugging, state management | Technical depth for AI PM role |
| **Codex** | Test-driven development, code quality | Quality engineering mindset |
| **Supabase** | Database design, auth, RLS security | Data architecture, security |

### After This Project, You'll Be Able To:
- Read and understand a Next.js + Supabase codebase
- Articulate technical tradeoffs to engineers (auth, state management, API design)
- Use AI coding tools productively for future projects
- Understand how Claude API integration works (directly relevant to AI PM role)

---

## Part 7: Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Antigravity free tier ends or rate limits tighten | Your code is in a Git repo — switch to Cursor ($20/mo) or Claude Code as fallback |
| Claude Code tokens run out mid-Phase 2 | Keep tasks small and specific. Use Antigravity for exploration, Claude Code only for implementation. |
| Drag-drop feature is too complex | Start with click-to-assign (dropdown), add drag-drop as enhancement later |
| AI schedule generation quality is poor | The validator catches bad output. Start with simple schedules (3 staff, 1 week), iterate. |
| You get stuck and can't debug | Ask Claude Code to explain the error. It's the best debugging tool in your toolkit. |
| The 50th prompt makes worse code than the 5th | Commit frequently. If quality degrades, start a new Antigravity session with fresh context. |

---

## Sources

- [Google Antigravity Official](https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/)
- [Antigravity Review 2026](https://leaveit2ai.com/ai-tools/code-development/antigravity)
- [Antigravity + Supabase MCP](https://lilys.ai/en/notes/openai-agent-builder-20260208/antigravity-supabase-mcp-build-app)
- [Antigravity Pricing & Limits](https://www.datastudios.org/post/is-google-antigravity-free-to-use-pricing-limits-and-what-developers-should-expect)
- [OpenAI Codex](https://openai.com/codex/)
- [Codex Review 2026](https://aitoolanalysis.com/chatgpt-codex-review/)
- [Codex Pricing](https://developers.openai.com/codex/pricing/)
- [Lovable vs Bolt](https://www.nocode.mba/articles/bolt-vs-lovable)
- [Lovable Export Guide](https://www.braingrid.ai/blog/how-to-download-lovable-project)
- [Aura.build Reviews](https://www.trustpilot.com/review/aura.build)
- [Manus AI Review](https://cybernews.com/ai-tools/manus-ai-review/)
- [Manus Pricing](https://manus.im/docs/introduction/plans)
- [Claude Code Full-Stack Guide](https://wasp.sh/blog/2026/01/29/claude-code-fullstack-development-essentials)
- [Best Vibe Coding Tools 2026](https://vibecoding.app/blog/best-vibe-coding-tools)
- [Multi-Tool Workflow Best Practices](https://makerkit.dev/blog/saas/best-vibe-coding-tools)

---

*Last updated: 2026-02-15*
