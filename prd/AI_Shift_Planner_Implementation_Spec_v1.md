# AI Shift Planner — Implementation Spec (Append to PRD)

> **Purpose:** This section fills the gaps identified in PRD assessment so an AI coding tool (Google Antigravity) can build the app without guessing. Append this to the Technical PRD or paste it as context when starting a new Antigravity session.

---

## 1. Tech Stack (EXPLICIT — DO NOT DEVIATE)

| Layer | Technology | Version | Why |
|-------|-----------|---------|-----|
| **Framework** | Next.js (App Router) | 15+ | Best AI tool support, file-based routing, API routes built-in |
| **Language** | TypeScript | 5+ | Type safety, better AI autocomplete |
| **Styling** | Tailwind CSS | 4+ | Universal AI support, utility-first |
| **Component Library** | shadcn/ui | Latest | Copy-paste components, works with Tailwind, great AI support |
| **Drag & Drop** | dnd-kit | Latest | Modern, accessible, well-documented for schedule grid |
| **State Management** | React Context + Zustand (for schedule page only) | Latest | Context for auth/simple state, Zustand for complex schedule state |
| **Database** | Supabase (hosted PostgreSQL) | Latest | Built-in auth, auto REST API, free tier, RLS |
| **Auth** | Supabase Auth | Built-in | Email/password, JWT handled automatically, role-based via RLS |
| **AI Integration** | Anthropic Claude API | claude-3-5-sonnet | Called from Next.js API routes (server-side only) |
| **Hosting** | Vercel | Latest | Best Next.js support, automatic Git deployments |
| **Vibe Coding Tool** | Google Antigravity | Latest | Primary development IDE |

---

## 2. Project Structure

```
ai-shift-planner/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, providers)
│   ├── page.tsx                  # Landing/redirect
│   ├── (auth)/                   # Auth group (no layout chrome)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/              # Authenticated manager routes
│   │   ├── layout.tsx            # Sidebar + top nav
│   │   ├── dashboard/page.tsx
│   │   ├── schedule/page.tsx     # Main schedule calendar (3-column)
│   │   ├── staff/page.tsx
│   │   ├── availability/page.tsx
│   │   ├── dates/page.tsx
│   │   ├── compliance/page.tsx
│   │   └── settings/page.tsx
│   ├── onboard/                  # 7-step wizard (manager only)
│   │   └── page.tsx
│   ├── staff-portal/             # Staff-only routes
│   │   ├── login/page.tsx
│   │   ├── schedule/page.tsx
│   │   └── availability/page.tsx
│   └── api/                      # API routes (server-side)
│       ├── schedules/
│       │   ├── generate/route.ts # AI schedule generation
│       │   └── [id]/
│       │       └── publish/route.ts
│       ├── compliance/
│       │   ├── report/route.ts
│       │   └── check/route.ts
│       └── dates/
│           └── import-holidays/route.ts
├── components/                   # Shared UI components
│   ├── ui/                       # shadcn/ui components
│   ├── schedule/                 # Schedule-specific components
│   │   ├── staff-roster-sidebar.tsx
│   │   ├── weekly-calendar.tsx
│   │   ├── hours-tracker-sidebar.tsx
│   │   ├── draggable-staff-card.tsx
│   │   └── droppable-shift-cell.tsx
│   ├── onboard/                  # Onboarding wizard steps
│   └── modals/                   # Publish, confirm, warning modals
├── lib/                          # Utilities & services
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client
│   │   └── middleware.ts         # Auth middleware
│   ├── ai/
│   │   ├── prompt-builder.ts     # buildClaudePrompt() from PRD
│   │   ├── generate.ts           # generateScheduleWithAI() from PRD
│   │   └── patterns.ts           # updateAIPatterns() from PRD
│   ├── validator.ts              # validateAssignments() from PRD
│   └── utils.ts                  # Shared helpers
├── stores/                       # Zustand stores
│   └── schedule-store.ts         # Schedule page state (drag-drop, optimistic updates)
├── types/                        # TypeScript type definitions
│   └── index.ts                  # Staff, Schedule, Shift, etc.
├── middleware.ts                  # Next.js middleware (auth redirects)
├── .env.local                    # Environment variables (see below)
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 3. Environment Variables (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key  # Server-side only, never expose

# Anthropic Claude API (server-side only)
CLAUDE_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **IMPORTANT:** `NEXT_PUBLIC_` prefix = exposed to browser. Only Supabase URL and anon key should have this prefix. Claude API key and service role key must NEVER have this prefix.

---

## 4. Supabase Setup

### Database Tables
Use the exact SQL DDL from the Technical PRD (all 14 tables). Run them in the Supabase SQL Editor in migration order (001-015).

### Auth Configuration
- **Provider:** Email/password only (MVP)
- **No email confirmation** (disable in Supabase Auth settings for MVP)
- **User metadata:** Store `role` ('manager' | 'staff') in Supabase `auth.users.raw_user_meta_data`
- **Auto-login on signup:** Supabase does this by default

### Row Level Security (RLS) Policies
```sql
-- Example: Staff visible only to same shop's manager or the staff themselves
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view their shop's staff"
  ON staff FOR SELECT
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view themselves"
  ON staff FOR SELECT
  USING (user_id = auth.uid());

-- Apply similar patterns to all tables
-- Schedules, shifts, availability: scoped to shop via shop_id
-- Shop: owner can read/write, staff can read
```

### Key Difference from PRD
The PRD defines Express.js API routes with JWT middleware. With Supabase:
- **CRUD operations** (staff, availability, dates, shop settings) → Use Supabase client directly from frontend (protected by RLS). No API route needed.
- **Complex operations** (AI generation, validation, publishing, compliance reports) → Use Next.js API routes with Supabase service role key.
- **Auth** (login, register, logout, refresh) → Use Supabase Auth client directly. No custom JWT code needed.

This means ~60% of the API endpoints in PRD 2 become unnecessary — Supabase handles them via its auto-generated REST API + RLS.

---

## 5. Auth Flow (Simplified with Supabase)

```
Register → Supabase createUser(email, password, { role: 'manager' })
         → Auto-login → Check if shop exists
         → If no shop → redirect to /onboard
         → If shop exists → redirect to /dashboard

Login    → Supabase signIn(email, password)
         → Check role in user metadata
         → Manager → /dashboard
         → Staff → /staff-portal/schedule

Middleware (middleware.ts):
  → Every request: check Supabase session
  → No session → redirect to /login (except public routes)
  → Manager without shop → redirect to /onboard
  → Staff accessing manager routes → redirect to /staff-portal
```

---

## 6. Schedule Page State (Zustand Store)

```typescript
// stores/schedule-store.ts — KEY STATE FOR DRAG-DROP
interface ScheduleStore {
  // Data
  weekStartDate: string;
  shifts: Shift[];
  staff: Staff[];
  warnings: Warning[];

  // UI State
  isDragging: boolean;
  draggedStaffId: string | null;

  // Optimistic Updates
  pendingChanges: Map<string, Shift>;  // shiftId → optimistic shift

  // Actions
  moveStaff: (staffId: string, targetShiftId: string, targetDate: string) => Promise<void>;
  undoLastChange: () => void;
  generateSchedule: (mode: 'fresh' | 'fill_empty') => Promise<void>;
  publishSchedule: () => Promise<void>;
}
```

**Drag-drop flow:**
1. User drags `<DraggableStaffCard>` → sets `isDragging`, `draggedStaffId`
2. `<DroppableShiftCell>` highlights valid/invalid based on real-time validation
3. On drop → optimistic update (instant UI) → call validator → if rejected, rollback + error toast
4. If valid → save to Supabase → confirm

---

## 7. Design System Tokens (for Tailwind config)

```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        background: '#18181b',
        'background-alt': '#232327',
        card: '#f3f4f6',
        text: '#e5e5e5',
        accent: '#8b5cf6',        // Purple - primary actions
        success: '#10b981',       // Green - published, OK
        warning: '#f59e0b',       // Orange - approaching limit, trainee
        danger: '#ef4444',        // Red - over limit, error
        info: '#3b82f6',          // Blue - info, links
        // Staff colors (assigned per person)
        'staff-1': '#3b82f6',
        'staff-2': '#8b5cf6',
        'staff-3': '#10b981',
        'staff-4': '#f59e0b',
        'staff-5': '#ef4444',
        'staff-6': '#eab308',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '24px',
      },
    },
  },
};
```

**Typography scale:** h1=24px bold, h2=20px semibold, body=14px, small=12px

---

## 8. Schedule Page Layout (3-Column — CRITICAL)

```
┌─────────────────────────────────────────────────────────────────┐
│ Top Bar: ← Week Selector →  │ [Regenerate] [Fill Empty] [Publish] │
├──────────┬──────────────────────────────────┬───────────────────┤
│ ROSTER   │        WEEKLY CALENDAR            │  HOURS TRACKER   │
│ (280px)  │        (flex-1)                   │  (320px)         │
│          │                                    │                  │
│ [Staff]  │  Mon  Tue  Wed  Thu  Fri  Sat  Sun │  Tom: 32/160    │
│ [Cards]  │ ┌───┬───┬───┬───┬───┬───┬───┐     │  ████████░░ 20% │
│          │ │Op │Op │Op │Op │Op │Op │Op │     │                  │
│ Tom ████ │ │Tom│Tom│   │Tom│   │Tom│Tom│     │  Emma: 25/160   │
│ Emma ███ │ ├───┼───┼───┼───┼───┼───┼───┤     │  ██████░░░░ 16% │
│ Sarah ██ │ │AM │AM │AM │AM │AM │AM │AM │     │                  │
│ Alex ███ │ │Em │Li │Tom│Em │Li │T+S│T+M│     │  Sarah: 15/20   │
│ Lisa ███ │ ├───┼───┼───┼───┼───┼───┼───┤     │  ████████████ 75%│
│ Maria ██ │ │PM │PM │PM │PM │PM │PM │PM │     │  ⚠️ Near limit  │
│          │ │Li │Tom│Li │Tom│Tom│Li │Li │     │                  │
│          │ └───┴───┴───┴───┴───┴───┴───┘     │  Alex: 10/20    │
│          │                                    │  ██████████░ 50% │
│          │  ⚠ Wed Opening: unfilled           │                  │
│          │  ⚠ Sarah near 20hr/wk limit        │  Lisa: 30/160   │
│          │                                    │  █████░░░░░ 19%  │
└──────────┴──────────────────────────────────┴───────────────────┘
```

---

## 9. What Supabase Handles vs What You Code

| Concern | Handled By | Notes |
|---------|-----------|-------|
| User registration/login | Supabase Auth | Direct client call, no API route |
| JWT tokens/refresh | Supabase Auth | Automatic, no manual handling |
| CRUD: staff, availability, dates, shop | Supabase Client + RLS | Direct from frontend |
| Staff hour queries | Supabase Client | Aggregate queries via `.rpc()` or views |
| AI schedule generation | Next.js API route (`/api/schedules/generate`) | Uses Claude API server-side |
| Assignment validation | Next.js API route | `validator.ts` runs server-side |
| Schedule publishing | Next.js API route (`/api/schedules/[id]/publish`) | Validates + locks + updates patterns |
| Denmark holiday import | Next.js API route | Calls nager.date API |
| Compliance report | Next.js API route or Supabase view | Aggregate query |
| PDF/CSV export | Next.js API route | Phase 2 |

---

## 10. Bootstrap Commands

```bash
# 1. Create Next.js project
npx create-next-app@latest ai-shift-planner --typescript --tailwind --eslint --app --src-dir=false

# 2. Install dependencies
cd ai-shift-planner
npm install @supabase/supabase-js @supabase/ssr          # Supabase
npm install @anthropic-ai/sdk                             # Claude API
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities  # Drag & drop
npm install zustand                                       # State management
npm install sonner                                        # Toast notifications
npx shadcn@latest init                                    # Component library

# 3. Add shadcn/ui components you'll need
npx shadcn@latest add button card dialog input label select table tabs badge progress separator sheet toast

# 4. Set up .env.local (see Section 3 above)

# 5. Run dev server
npm run dev
```

---

## 11. AI Service Adaptation (PRD → Next.js)

The PRD's `services/ai.js` and `services/validator.js` use CommonJS (`require`). Convert to ES modules for Next.js:

- `require('@anthropic-ai/sdk')` → `import Anthropic from '@anthropic-ai/sdk'`
- `require('cors')` → Not needed (Next.js handles CORS)
- `module.exports` → `export function ...`
- DB queries (`db.query(...)`) → `supabase.from(...).select(...)` or `supabase.rpc(...)`

The prompt template, validator logic, and AI pattern learning code from the PRD should be used **as-is** (after syntax conversion). They are production-ready.

---

## 12. Known PRD Issues to Fix During Development

1. **Maria's status:** Seed SQL lists Maria as `'Staff'` but her profile (20hr/wk, no opening/closing) matches a student/trainee. **RESOLVED:** `AI_Shift_Planner_Seed_Data.sql` explicitly sets her status to `'Trainee'`.
2. **Maria's staff ID:** Seed SQL uses `d0000000-...0007` (skips `...0006`). Not a bug, but may confuse sequential lookups.
3. **Hour math:** PRD 2 states "20 hrs/week = 80 hrs/month" but 20 × 4.3 ≈ 86 hrs/month. Use the weekly limit (20/wk) as source of truth; monthly equivalent is informational only.

---

## 13. Out of Scope (MVP)

Carried forward from PRD + additions:
- Shift swaps between staff (Phase 2)
- Push/email/SMS notifications (Phase 2)
- Tips management, payroll/HR integrations
- Native mobile app
- Email confirmation on signup
- Password reset flow
- Split shift availability (multiple windows per day)
- Immutable schedule versioning (using `schedule_edits` audit trail instead)
- Real-time updates (polling on page load is sufficient for MVP)

---

*This spec + the two existing PRDs = complete context for AI-assisted development.*
*Stack: Next.js 15 + TypeScript + Tailwind + shadcn/ui + Supabase + Claude API + Vercel*
*Tool: Google Antigravity*
