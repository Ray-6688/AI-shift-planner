# AI Shift Planner — Product Requirements Document (v10 FINAL)

---

## WHY: Business Case, Problem, Compliance & Market Opportunity

### Pain Point: Manual Staff Scheduling

For Sober Boba Fisketorvet managers (e.g., Rita):

- Check staff availability via WhatsApp: 10 min/week
- Build Google Calendar weekly schedule: 15 min/week
- Manually check staff hour limits (weekly/monthly caps vary per employee): 10 min/week per 4 part-timers
- Notify by WhatsApp: 5 min/week
- **Total Time Cost:** 30–60 min/week, or 26–52 hours/year per location.
- **Financial Impact:** Loss of €650–1,560/year in manager productivity for ONE shop.

### Configurable Hour Limits (Per-Staff Compliance)

Hour limits vary by employment type and are **configured per staff member**, not hardcoded as a single rule:

- **Full-time contracts:** Typically 160 hrs/month (37 hrs/week Danish standard).
- **SU-receiving students:** Often self-limit to ~20 hrs/week to stay within fribeløb (annual income threshold).
- **Non-EU study permit holders:** May be subject to 90 hrs/month (Sep–May) per SIRI residence permit rules.
- **Part-time contracts:** As specified in individual employment agreement.

The system supports **both weekly and monthly** tracking via `hour_limit_type` and `hour_limit_value` on each staff record. The `hour_limit_reason` field documents the source (e.g., "SU fribeløb", "Study permit 90hr/mo", "Part-time contract").

> **⚠️ Legal disclaimer:** This system enforces operational hour caps as configured by the manager. It does not constitute legal advice. Managers must consult the relevant rules for each employee's specific visa, SU, or contract status. Default values are guidelines only.

- **Risk if limits are exceeded:** Potential retroactive pay obligations, lost student benefits, fines, or legal audit depending on the employee's specific situation.

### Competitor Gaps

| Product | Price | AI Learning | DK Law | Setup | Coverage | Key Gaps |
|---------|-------|-------------|--------|-------|----------|----------|
| 7shifts | €49/month | No | No | 15min | Static | US rules only |
| Homebase | €40–60/mo | No | No | 15min | Static | No learning |
| Humanforce | €60+/mo | No | Yes* | 15min | Static | Price, phased up |
| **THIS SOLUTION** | **€20/mo*** | **Yes** | **Yes** | **5min** | **Dynamic** | **Designed DK/SMB** |

---

## WHO: Users, Personas, Shop, Staff & Data

### Shop/Customer

- **Name:** Sober Boba Fisketorvet
- **Location:** Kalvebod Brygge 59, København
- **Manager:** Rita (Owner, full access, ray@soberboba.com)
- **Notes:** High evening/weekend surge from local cinema.

### Staff and User Linkage

| Name | Status | Gender | Age | Exp. | Skills (Open/Tea/Close) | Capabilities | Hour Cap/Type | Availability | Color |
|------|--------|--------|-----|------|-------------------------|-------------|---------------|-------------|-------|
| Tom | Staff | M | 35 | 3yr | 5/5/4 | All | 160/mo | Mon–Sun 8–23 | #3b82f6 |
| Emma | Staff | F | 28 | 2yr | 4/4/4 | All | 160/mo | Mon–Fri 9–18 | #8b5cf6 |
| Sarah | Trainee | F | 22 | 6m | 3/3/0 | Open/Tea | 20/wk (SU) | M/W/F 11–21 | #10b981 |
| Alex | Trainee | M | 20 | 3m | 2/2/0 | Tea | 20/wk (SU) | T/Th/Sat 14–22 | #f59e0b |
| Lisa | Staff | F | 32 | 4yr | 4/4/3 | All | 160/mo | Tue–Sun 10–22 | #ef4444 |
| Maria | Staff | F | 25 | 1yr | 3/3/0 | Tea | 20/wk (SU) | Sat/Sun 10–22 | #eab308 |

Staff are linked to users via `user_id` foreign key (see DB schema below).

---

## WHAT: Features, Flows, Screens, Validation

### Authentication & Access Control

- Signup/Login:
  - Email + password, auto-login on signup. NO email confirmation in MVP.
  - JWT: access (1hr), refresh (7d), httpOnly cookie (secure).
  - Manager/staff roles: Only manager can edit staff/schedule.

### users Table (NO CIRCULAR KEY)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('manager', 'staff')) DEFAULT 'staff',
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    -- NO staff_id column! Link is one-directional: staff.user_id → users.id
);
```

### Complete staff Table Schema

```sql
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Basic Info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    gender VARCHAR(20),
    status VARCHAR(20) CHECK (status IN ('Staff', 'Trainee')) DEFAULT 'Staff',
    color VARCHAR(7) NOT NULL,

    -- Capabilities (checkboxes)
    can_shop_opening BOOLEAN DEFAULT FALSE,
    can_bubble_tea_making BOOLEAN DEFAULT FALSE,
    can_shop_closing BOOLEAN DEFAULT FALSE,

    -- Skills (1-5, NULL if capability not checked)
    skill_shop_opening INT CHECK (skill_shop_opening >= 1 AND skill_shop_opening <= 5),
    skill_bubble_tea_making INT CHECK (skill_bubble_tea_making >= 1 AND skill_bubble_tea_making <= 5),
    skill_shop_closing INT CHECK (skill_shop_closing >= 1 AND skill_shop_closing <= 5),

    -- Hour Limits (CONFIGURABLE per staff)
    hour_limit_type VARCHAR(20) CHECK (hour_limit_type IN ('weekly', 'monthly')) DEFAULT 'monthly',
    hour_limit_value INT NOT NULL DEFAULT 160,
    hour_limit_reason VARCHAR(255),

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_staff_shop ON staff(shop_id);
CREATE INDEX idx_staff_user ON staff(user_id);
CREATE INDEX idx_staff_active ON staff(is_active);
```

### Shops Table

```sql
CREATE TABLE shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Europe/Copenhagen',
    week_start VARCHAR(10) DEFAULT 'monday',
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_shops_owner_id ON shops(owner_id);
```

### Shop Operating Hours Table

Stores per-day operating hours captured during onboarding (Step 3).

```sql
CREATE TABLE shop_operating_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    day_of_week INT CHECK (day_of_week >= 0 AND day_of_week <= 6) NOT NULL,
    -- 0=Monday, 6=Sunday (ISO convention)
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(shop_id, day_of_week)
);
CREATE INDEX idx_shop_hours_shop ON shop_operating_hours(shop_id);
```

### important_dates Table

```sql
CREATE TABLE important_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(50) CHECK (type IN ('holiday', 'busy_event', 'regular_event')) DEFAULT 'regular_event',
    shop_closed BOOLEAN DEFAULT FALSE,
    affects_staffing BOOLEAN DEFAULT FALSE,
    notes TEXT,
    source VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(shop_id, date, name)
);
CREATE INDEX idx_important_dates_shop ON important_dates(shop_id);
CREATE INDEX idx_important_dates_date ON important_dates(date);
CREATE INDEX idx_important_dates_type ON important_dates(type);
```

### Shift Periods Table

```sql
CREATE TABLE shift_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    day_type VARCHAR(20) CHECK (day_type IN ('weekday', 'weekend', 'special')) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(shop_id, label, day_type)
);
CREATE INDEX idx_shift_periods_shop ON shift_periods(shop_id);
CREATE INDEX idx_shift_periods_day_type ON shift_periods(day_type);
```

### Staff Availability Table

```sql
CREATE TABLE staff_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    day_of_week INT CHECK (day_of_week >= 0 AND day_of_week <= 6) NOT NULL,
    -- day_of_week: 0=Monday, 6=Sunday (ISO 8601 convention, NOT JS getDay())
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    -- MVP: One contiguous window per staff per day. To support split shifts
    -- (e.g., 9-12 + 17-21), remove UNIQUE and add overlap validation in app layer.
    UNIQUE(staff_id, day_of_week)
);
CREATE INDEX idx_staff_availability_staff ON staff_availability(staff_id);
CREATE INDEX idx_staff_availability_day ON staff_availability(day_of_week);
```

### Schedules Table

```sql
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('draft', 'ai_generated', 'edited', 'published')) DEFAULT 'draft',
    created_by UUID REFERENCES users(id),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(shop_id, week_start_date)
);
-- MVP versioning: schedule_edits table tracks all changes (edit_type, old_value, new_value)
-- as the audit trail. Full immutable snapshot versioning deferred to post-MVP.
CREATE INDEX idx_schedules_shop ON schedules(shop_id);
CREATE INDEX idx_schedules_status ON schedules(status);
CREATE INDEX idx_schedules_week ON schedules(week_start_date);
```

### Shifts Table (Individual Assignments)

Each row = one staff member assigned to one shift period on one date. Multi-staff shifts produce multiple rows sharing the same `schedule_id`, `shift_period_id`, and `date`.

```sql
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
    shift_period_id UUID REFERENCES shift_periods(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    duration_hours DECIMAL(4,2) NOT NULL,
    ai_confidence DECIMAL(3,2),
    ai_reasoning TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_shifts_schedule ON shifts(schedule_id);
CREATE INDEX idx_shifts_staff ON shifts(staff_id);
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_shifts_period ON shifts(shift_period_id);
-- Composite index for compliance queries
CREATE INDEX idx_shifts_staff_date ON shifts(staff_id, date);
-- Prevent duplicate: same person assigned to same shift on same date in same schedule
CREATE UNIQUE INDEX idx_shifts_unique_assignment ON shifts(schedule_id, shift_period_id, date, staff_id);
```

> **Assignment model:** The AI returns `staff_names[]` per assignment (e.g., `["Tom", "Sarah"]`). The backend unpacks each name into a separate `shifts` row. A Morning shift with 2 staff = 2 rows in `shifts`, both with the same `schedule_id`, `shift_period_id`, and `date`.

### Staffing Rules, Constraints, Patterns, and Schedule Edits

```sql
CREATE TABLE staffing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    day_type VARCHAR(20) CHECK (day_type IN ('weekday', 'weekend', 'special')) NOT NULL,
    shift_period_id UUID REFERENCES shift_periods(id) ON DELETE CASCADE,
    staff_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(shop_id, day_type, shift_period_id)
);

CREATE TABLE scheduling_constraints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    constraint_type VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    config JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE schedule_edits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
    edited_by UUID REFERENCES users(id),
    edit_type VARCHAR(50) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    shift_period_id UUID REFERENCES shift_periods(id) ON DELETE CASCADE,
    day_of_week INT CHECK (day_of_week >= 0 AND day_of_week <= 6),
    assignment_count INT DEFAULT 0,
    opportunity_count INT DEFAULT 0,
    last_assigned_date DATE,
    confidence DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(shop_id, staff_id, shift_period_id, day_of_week)
);

CREATE TABLE event_staffing_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    shift_period_id UUID REFERENCES shift_periods(id) ON DELETE CASCADE,
    avg_staff_assigned DECIMAL(3,1),
    occurrences INT DEFAULT 0,
    last_occurred DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(shop_id, event_type, shift_period_id)
);
```

### Onboarding Flow

- After first login as manager, redirect to `/onboard`
- 7-step wizard:
  1. Welcome
  2. Shop Basics (name, timezone, week start)
  3. Operating Hours (per weekday, open/close times)
  4. Shift Structure (# shifts, label, times)
  5. Staffing Rules (defaults per shift & day type)
  6. Add Staff (full staff, capabilities/skills/limits)
  7. Important Dates (import Denmark holidays, add events)
- All data persisted step-by-step as per table definitions above

---

## COMPLETE Claude Prompt Template & AI Service (INLINE, CRITICAL)

```javascript
// ============================================================
// services/ai.js — COMPLETE IMPLEMENTATION
// ============================================================

const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';

// ── Helper: Format staff for prompt ──────────────────────────
function formatStaffForPrompt(staffList, hoursMap) {
  return staffList.map(s => {
    const caps = [];
    if (s.can_shop_opening) caps.push(`Opening(${s.skill_shop_opening})`);
    if (s.can_bubble_tea_making) caps.push(`BubbleTea(${s.skill_bubble_tea_making})`);
    if (s.can_shop_closing) caps.push(`Closing(${s.skill_shop_closing})`);

    const hours = hoursMap[s.id] || 0;
    const limitLabel = s.hour_limit_type === 'weekly' ? 'wk' : 'mo';
    const limitWarning = hours >= s.hour_limit_value * 0.9
      ? ' ⚠️ NEAR LIMIT' : '';

    return `- ${s.name} [id:${s.id}] [${s.status}]: Skills: ${caps.join(', ')} | Limit: ${hours}/${s.hour_limit_value} ${limitLabel}${s.hour_limit_reason ? ` (${s.hour_limit_reason})` : ''}${limitWarning}`;
  }).join('\n');
}

// ── Helper: Format availability for prompt ───────────────────
function formatAvailabilityForPrompt(staffList, availabilityMap) {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return staffList.map(s => {
    const avail = availabilityMap[s.id] || [];
    const slots = avail
      .filter(a => a.is_available)
      .map(a => `${dayNames[a.day_of_week]} ${a.start_time}-${a.end_time}`)
      .join(', ');
    return `- ${s.name}: ${slots || 'No availability set'}`;
  }).join('\n');
}

// ── Helper: Format shift periods ─────────────────────────────
function formatShiftsForPrompt(shiftPeriods) {
  return shiftPeriods.map(sp =>
    `- ${sp.label}: ${sp.start_time}–${sp.end_time} (day_type: ${sp.day_type})`
  ).join('\n');
}

// ── Helper: Format staffing rules ────────────────────────────
function formatStaffingRules(rules, shiftPeriods) {
  return rules.map(r => {
    const sp = shiftPeriods.find(s => s.id === r.shift_period_id);
    return `- ${sp?.label || 'Unknown'} on ${r.day_type}: ${r.staff_count} staff required`;
  }).join('\n');
}

// ── Helper: Format historical patterns ───────────────────────
// Weighting: last 4 weeks = 100%, weeks 5-8 = 70%, weeks 9-12 = 40%
function formatPatternsForPrompt(patterns, staffList) {
  if (!patterns || patterns.length === 0) return 'No historical data yet (first schedule).';

  return patterns.map(p => {
    const staff = staffList.find(s => s.id === p.staff_id);
    const ratio = p.opportunity_count > 0
      ? (p.assignment_count / p.opportunity_count * 100).toFixed(0)
      : 0;
    return `- ${staff?.name || 'Unknown'}: shift=${p.shift_label}, day=${p.day_of_week}, assigned ${p.assignment_count}/${p.opportunity_count} times (${ratio}%), confidence: ${p.confidence}`;
  }).join('\n');
}

// ── Helper: Format important dates ───────────────────────────
function formatImportantDates(dates) {
  if (!dates || dates.length === 0) return 'No special dates this week.';
  return dates.map(d =>
    `- ${d.date}: ${d.name} (${d.type})${d.notes ? ' — ' + d.notes : ''}`
  ).join('\n');
}

// ══════════════════════════════════════════════════════════════
// MAIN: Build the full Claude prompt
// ══════════════════════════════════════════════════════════════
function buildClaudePrompt(context) {
  const {
    shop,
    weekStartDate,       // e.g. '2026-02-09'
    weekEndDate,         // e.g. '2026-02-15'
    shiftPeriods,        // array of shift_periods rows for this week's day_types
    staffingRules,       // array of staffing_rules rows
    staff,               // array of active staff rows
    availabilityMap,     // { staffId: [availability rows] }
    hoursMap,            // { staffId: current booked hours (for their limit period) }
    patterns,            // array of ai_patterns with shift_label joined
    eventPatterns,       // array of event_staffing_patterns
    importantDates,      // array of important_dates in this week
    existingAssignments, // array of shifts already assigned (for "Fill Empty" mode)
    mode                 // 'fresh' or 'fill_empty'
  } = context;

  const systemMessage = `You are an expert staff scheduling AI for a small business in Denmark.
Your job: generate an optimal weekly shift schedule that is LEGAL, FAIR, and OPERATIONALLY SOUND.

CRITICAL RULES (HARD CONSTRAINTS — never violate):
1. NEVER assign staff to a shift outside their availability window.
2. NEVER assign staff who lack the required capability for a shift.
3. NEVER exceed a staff member's hour_limit_value for their hour_limit_type (weekly or monthly).
   - For weekly limits: sum ALL shifts in the week ${weekStartDate} to ${weekEndDate}.
   - For monthly limits: sum ALL shifts in the calendar month of EACH SHIFT'S DATE (not the week start).
     If a week spans two months (e.g., Jan 28 – Feb 3), check Jan shifts against Jan total and Feb shifts against Feb total separately.
4. Trainees (status=Trainee) must ALWAYS be paired with at least one Staff member on the same shift.
   Trainees can NEVER be the sole person assigned to any shift.
5. Shop Closing shifts require at least one staff member with can_shop_closing=true and skill >= 3.
6. Every shift must meet the minimum staff count from staffing rules.

SOFT CONSTRAINTS (prefer, but can violate with warning):
- Distribute hours fairly across staff with similar roles.
- Prefer higher-skilled staff for busier day_types (weekend, special).
- Respect historical patterns — staff who regularly work a shift should be preferred.
- Avoid scheduling the same person for Opening + Evening on the same day (long gap).

HISTORICAL PATTERN WEIGHTING:
- Last 4 weeks: weight 100% (strongest signal)
- Weeks 5–8: weight 70%
- Weeks 9–12: weight 40%
- Older: ignore

If you cannot fill a shift without violating hard constraints, leave it EMPTY and add a warning.`;

  const userMessage = `
## SHOP
Name: ${shop.name}
Timezone: ${shop.timezone}
Week: ${weekStartDate} to ${weekEndDate}

## SHIFT PERIODS
${formatShiftsForPrompt(shiftPeriods)}

## STAFFING RULES (minimum headcount per shift per day_type)
${formatStaffingRules(staffingRules, shiftPeriods)}

## STAFF ROSTER
${formatStaffForPrompt(staff, hoursMap)}

## STAFF AVAILABILITY
${formatAvailabilityForPrompt(staff, availabilityMap)}

## IMPORTANT DATES THIS WEEK
${formatImportantDates(importantDates)}

## HISTORICAL PATTERNS (weighted)
${formatPatternsForPrompt(patterns, staff)}

## EVENT STAFFING PATTERNS
${eventPatterns && eventPatterns.length > 0
    ? eventPatterns.map(ep =>
        \`- Event type "\${ep.event_type}", shift \${ep.shift_label}: avg \${ep.avg_staff_assigned} staff over \${ep.occurrences} occurrences\`
      ).join('\\n')
    : 'No event patterns yet.'}

## MODE
${mode === 'fill_empty'
    ? \`FILL EMPTY ONLY. The following shifts are already assigned — do NOT change them:\\n\${
        existingAssignments.map(a =>
          \`- \${a.date} \${a.shift_label}: \${a.staff_name}\`
        ).join('\\n')
      }\\nOnly assign staff to shifts that have NO assignment.\`
    : 'FRESH START. Generate a complete schedule from scratch.'}

## REQUIRED OUTPUT FORMAT
Respond with ONLY valid JSON matching this exact schema. No markdown, no explanation outside JSON.
Prefer staff_ids over staff_names when possible. Always include both.

{
  "assignments": [
    {
      "date": "YYYY-MM-DD",
      "shift_period_label": "Opening",
      "staff_ids": ["uuid-of-tom"],
      "staff_names": ["Tom"],
      "confidence": 0.92,
      "reasoning": "Tom has Opening skill 5, available, 68/160 monthly hours"
    }
  ],
  "warnings": [
    {
      "date": "YYYY-MM-DD",
      "shift_period_label": "Morning",
      "staff_name": "Sarah",
      "type": "cap_approaching",
      "severity": "medium",
      "detail": "Sarah will be at 19/20 weekly hours after this assignment"
    }
  ],
  "unfilled_shifts": [
    {
      "date": "YYYY-MM-DD",
      "shift_period_label": "Evening",
      "reason": "No staff with closing capability available on this date"
    }
  ],
  "summary": {
    "total_shifts": 21,
    "filled": 19,
    "unfilled": 2,
    "warnings_count": 3,
    "overall_confidence": 0.87
  }
}`;

  return { systemMessage, userMessage };
}

// ══════════════════════════════════════════════════════════════
// Call Claude API
// ══════════════════════════════════════════════════════════════
async function generateScheduleWithAI(context) {
  const { systemMessage, userMessage } = buildClaudePrompt(context);

  const MAX_RETRIES = 2;
  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 4000,
        temperature: 0.3,
        system: systemMessage,
        messages: [{ role: 'user', content: userMessage }],
      });

      const text = response.content[0].text;

      // Parse and validate JSON
      // Strip markdown code fences if Claude wraps output
      const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);

      // Schema validation
      if (!parsed.assignments || !Array.isArray(parsed.assignments)) {
        throw new Error('Invalid response: missing assignments array');
      }
      if (!parsed.summary || typeof parsed.summary.total_shifts !== 'number') {
        throw new Error('Invalid response: missing or malformed summary');
      }

      // Validate each assignment references real staff and shifts
      for (const assignment of parsed.assignments) {
        if (!assignment.date || !assignment.shift_period_label ||
            (!assignment.staff_ids?.length && !assignment.staff_names?.length)) {
          throw new Error(`Invalid assignment: missing required fields in ${JSON.stringify(assignment)}`);
        }
      }

      // ── Name → ID Resolution ──────────────────────────────────
      // AI returns human-readable names for prompt clarity.
      // Backend resolves to IDs before saving to DB.
      if (!parsed.warnings) parsed.warnings = [];
      if (!parsed.unfilled_shifts) parsed.unfilled_shifts = [];

      const staffLookup = {};
      context.staff.forEach(s => { staffLookup[s.name.toLowerCase()] = s.id; });
      const shiftLookup = {};
      context.shiftPeriods.forEach(sp => {
        const key = `${sp.label.toLowerCase()}|${sp.day_type}`;
        shiftLookup[key] = sp.id;
      });

      for (const assignment of parsed.assignments) {
        // Prefer staff_ids if AI returned them; fall back to name matching
        if (assignment.staff_ids && assignment.staff_ids.length > 0) {
          // Validate that returned IDs exist in our staff list
          const validIds = assignment.staff_ids.filter(id => context.staff.some(s => s.id === id));
          const invalidIds = assignment.staff_ids.filter(id => !context.staff.some(s => s.id === id));
          assignment.staff_ids = validIds;
          if (invalidIds.length > 0) {
            parsed.warnings.push({
              date: assignment.date,
              shift_period_label: assignment.shift_period_label,
              staff_name: null,
              type: 'unmatched_staff_id',
              severity: 'high',
              detail: `AI returned unknown staff ID(s): ${invalidIds.join(', ')}. Falling back to names if available.`
            });
          }
          // If ALL IDs were invalid but names exist, fall back to name matching
          if (validIds.length === 0 && assignment.staff_names?.length) {
            assignment.staff_ids = [];
            const fallbackUnmatched = [];
            for (const name of assignment.staff_names) {
              const id = staffLookup[name.toLowerCase()];
              if (id) {
                assignment.staff_ids.push(id);
              } else {
                fallbackUnmatched.push(name);
              }
            }
            if (fallbackUnmatched.length > 0) {
              parsed.warnings.push({
                date: assignment.date,
                shift_period_label: assignment.shift_period_label,
                staff_name: fallbackUnmatched.join(', '),
                type: 'unmatched_staff',
                severity: 'high',
                detail: `ID fallback to names: unknown name(s): ${fallbackUnmatched.join(', ')}. Skipped.`
              });
            }
          }
        } else if (assignment.staff_names?.length) {
          // No IDs provided — use name matching
          assignment.staff_ids = [];
          const unmatchedNames = [];
          for (const name of assignment.staff_names) {
            const id = staffLookup[name.toLowerCase()];
            if (id) {
              assignment.staff_ids.push(id);
            } else {
              unmatchedNames.push(name);
            }
          }
          if (unmatchedNames.length > 0) {
            parsed.warnings.push({
              date: assignment.date,
              shift_period_label: assignment.shift_period_label,
              staff_name: unmatchedNames.join(', '),
              type: 'unmatched_staff',
              severity: 'high',
              detail: `AI returned unknown staff name(s): ${unmatchedNames.join(', ')}. Skipped.`
            });
          }
        }

        // Resolve shift period label → shift_period_id
        // Timezone-safe ISO day-of-week: parse as UTC to avoid local TZ shift
        const [y, m, d] = assignment.date.split('-').map(Number);
        const utcDay = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Sun
        const dayType = (utcDay === 0 || utcDay === 6) ? 'weekend' : 'weekday';
        // Check important_dates for 'special' override
        // Only dates with affects_staffing=true, shop_closed=false,
        // AND type is 'busy_event' or 'holiday' elevate to 'special'
        const isSpecial = context.importantDates?.some(d =>
          d.date === assignment.date &&
          d.affects_staffing === true &&
          d.shop_closed !== true &&
          (d.type === 'busy_event' || d.type === 'holiday')
        );
        const effectiveDayType = isSpecial ? 'special' : dayType;
        const spKey = `${assignment.shift_period_label.toLowerCase()}|${effectiveDayType}`;
        assignment.shift_period_id = shiftLookup[spKey] || null;

        if (!assignment.shift_period_id) {
          parsed.warnings.push({
            date: assignment.date,
            shift_period_label: assignment.shift_period_label,
            staff_name: null,
            type: 'unmatched_shift_period',
            severity: 'high',
            detail: `Could not resolve shift period "${assignment.shift_period_label}" for ${effectiveDayType} on ${assignment.date}`
          });
        }
      }

      // Filter out assignments with no resolved staff or shift period
      parsed.assignments = parsed.assignments.filter(a =>
        a.staff_ids && a.staff_ids.length > 0 && a.shift_period_id
      );

      // Recompute summary after filtering
      parsed.summary = {
        total_shifts: (parsed.assignments.length + (parsed.unfilled_shifts?.length || 0)),
        filled: parsed.assignments.length,
        unfilled: parsed.unfilled_shifts?.length || 0,
        warnings_count: parsed.warnings.length,
        overall_confidence: parsed.assignments.length > 0
          ? +(parsed.assignments.reduce((sum, a) => sum + (a.confidence || 0), 0) / parsed.assignments.length).toFixed(2)
          : 0
      };

      return parsed;

    } catch (error) {
      lastError = error;
      console.error(`AI attempt ${attempt + 1} failed:`, error.message);

      if (error.status === 429) {
        // Rate limited — wait before retry
        await new Promise(r => setTimeout(r, 60000));
        continue;
      }
      if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
        // Timeout — retry immediately
        continue;
      }
      if (error instanceof SyntaxError) {
        // Malformed JSON — retry with note
        console.error('Claude returned invalid JSON, retrying...');
        continue;
      }
      // Unknown error — don't retry
      break;
    }
  }

  // All retries exhausted — return fallback
  return {
    assignments: [],
    warnings: [{
      date: null,
      shift_period_label: null,
      staff_name: null,
      type: 'ai_error',
      severity: 'critical',
      detail: `AI generation failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}. Use manual assignment.`
    }],
    unfilled_shifts: [],
    summary: {
      total_shifts: 0, filled: 0, unfilled: 0,
      warnings_count: 1, overall_confidence: 0
    }
  };
}

// ══════════════════════════════════════════════════════════════
// Post-publish: Update AI learning patterns
// ⚠️ MVP LIMITATION: assignment_count and opportunity_count both increment on assignment,
// so confidence saturates quickly. Post-MVP: track opportunity_count independently
// (all slots where staff COULD have been assigned, not just where they WERE).
// ══════════════════════════════════════════════════════════════
async function updateAIPatterns(shopId, scheduleId, db) {
  const shifts = await db.query(`
    SELECT s.staff_id, s.shift_period_id, s.date,
           EXTRACT(ISODOW FROM s.date) - 1 AS day_of_week
    FROM shifts s
    WHERE s.schedule_id = $1
  `, [scheduleId]);

  for (const shift of shifts.rows) {
    await db.query(`
      INSERT INTO ai_patterns (shop_id, staff_id, shift_period_id, day_of_week,
                               assignment_count, opportunity_count, last_assigned_date, confidence)
      VALUES ($1, $2, $3, $4, 1, 1, $5, 50.00)
      ON CONFLICT (shop_id, staff_id, shift_period_id, day_of_week)
      DO UPDATE SET
        assignment_count = ai_patterns.assignment_count + 1,
        opportunity_count = ai_patterns.opportunity_count + 1,
        last_assigned_date = $5,
        confidence = LEAST(99.99,
          (ai_patterns.assignment_count + 1)::DECIMAL / (ai_patterns.opportunity_count + 1) * 100
        ),
        updated_at = NOW()
    `, [shopId, shift.staff_id, shift.shift_period_id, shift.day_of_week, shift.date]);
  }
}

module.exports = {
  buildClaudePrompt,
  generateScheduleWithAI,
  updateAIPatterns,
};
// NOTE: validateAssignments is in services/validator.js — import separately
```

### Server-Side Assignment Validator (CRITICAL — runs BEFORE DB write)

The AI is a suggestion engine. This deterministic validator enforces all hard constraints server-side. Every assignment must pass ALL checks or it is rejected with an error.

**Call flow:** `generateScheduleWithAI()` → `validateAssignments()` → DB INSERT

```javascript
// ============================================================
// services/validator.js — DETERMINISTIC HARD CONSTRAINT CHECKER
// ============================================================

/**
 * Validates AI-generated (or manual drag-drop) assignments against all hard constraints.
 * Returns { valid: [...], rejected: [...], warnings: [...] }
 *
 * @param {Object} params
 * @param {Array}  params.assignments  - Array of { date, shift_period_id, staff_ids, shift_period_label, ... }
 * @param {Array}  params.staff        - Array of staff rows (with capabilities, skills, limits)
 * @param {Object} params.availabilityMap - { staffId: [{ day_of_week, start_time, end_time, is_available }] }
 * @param {Array}  params.shiftPeriods - Array of shift_period rows
 * @param {Array}  params.staffingRules - Array of staffing_rules rows
 * @param {Object} params.existingHours - { staffId: { weekly: X, monthly: { 'YYYY-MM': Y } } } — already-booked hours per period
 * @param {Array}  params.constraints  - Array of scheduling_constraints rows (enabled only)
 * @param {Array}  params.importantDates - Array of important_dates rows for this week
 * @param {Array}  params.operatingHours - Array of shop_operating_hours rows (7 entries, one per weekday)
 * @param {string} params.weekStartDate
 * @param {string} params.weekEndDate
 */
function validateAssignments({
  assignments, staff, availabilityMap, shiftPeriods, staffingRules,
  existingHours, constraints, importantDates, operatingHours, weekStartDate, weekEndDate
}) {
  const valid = [];
  const rejected = [];
  const warnings = [];

  // ── NORMALIZE: Group assignments by (date, shift_period_id) ──
  // AI may return split objects for the same shift (one per staff).
  // Merge them so trainee-pairing and staffing checks see the full picture.
  const groupedMap = {};
  for (const a of assignments) {
    const key = `${a.date}|${a.shift_period_id}`;
    if (!groupedMap[key]) {
      groupedMap[key] = { ...a, staff_ids: new Set(a.staff_ids || []) };
    } else {
      (a.staff_ids || []).forEach(id => groupedMap[key].staff_ids.add(id));
      // Keep highest confidence
      if ((a.confidence || 0) > (groupedMap[key].confidence || 0)) {
        groupedMap[key].confidence = a.confidence;
      }
    }
  }
  // Convert Sets back to arrays
  const normalizedAssignments = Object.values(groupedMap).map(a => ({
    ...a,
    staff_ids: Array.from(a.staff_ids)
  }));

  const staffMap = {};
  staff.forEach(s => { staffMap[s.id] = s; });

  const spMap = {};
  shiftPeriods.forEach(sp => { spMap[sp.id] = sp; });

  // Track hours added during this validation pass (cumulative within the batch)
  const addedHours = {}; // { staffId: { weekly: 0, monthly: { 'YYYY-MM': 0 } } }

  const constraintMap = {};
  (constraints || []).forEach(c => { constraintMap[c.constraint_type] = c; });

  // Track daily assignments for same-day constraint checks
  const dailyAssignments = {}; // { staffId: { 'YYYY-MM-DD': [shift_period_ids] } }

  for (const assignment of normalizedAssignments) {
    const sp = spMap[assignment.shift_period_id];
    if (!sp) {
      rejected.push({ ...assignment, reason: `Unknown shift_period_id: ${assignment.shift_period_id}` });
      continue;
    }

    const duration = _calcDuration(sp.start_time, sp.end_time);
    const errors = [];

    for (const staffId of (assignment.staff_ids || [])) {
      const s = staffMap[staffId];
      if (!s) {
        errors.push(`Staff ${staffId} not found`);
        continue;
      }

      // ── CHECK 1: Availability ────────────────────────────
      const dayOfWeek = _isoDayOfWeek(assignment.date); // 0=Mon, 6=Sun
      const avail = (availabilityMap[staffId] || [])
        .find(a => a.day_of_week === dayOfWeek && a.is_available);
      if (!avail) {
        errors.push(`${s.name} not available on day ${dayOfWeek} (${assignment.date})`);
        continue;
      }
      if (sp.start_time < avail.start_time || sp.end_time > avail.end_time) {
        errors.push(`${s.name} available ${avail.start_time}-${avail.end_time}, shift is ${sp.start_time}-${sp.end_time}`);
        continue;
      }

      // ── CHECK 2: Capability ──────────────────────────────
      if (sp.label === 'Opening' && !s.can_shop_opening) {
        errors.push(`${s.name} cannot do Opening (capability not enabled)`);
        continue;
      }
      if (sp.label === 'Evening' && !s.can_shop_closing) {
        // Only required if closing constraint enabled — checked below
      }

      // ── CHECK 3: Hour limits ─────────────────────────────
      if (!addedHours[staffId]) {
        addedHours[staffId] = {
          weekly: 0,
          monthly: {}
        };
      }
      const existing = existingHours[staffId] || { weekly: 0, monthly: {} };

      if (s.hour_limit_type === 'weekly') {
        const totalWeekly = existing.weekly + addedHours[staffId].weekly + duration;
        if (totalWeekly > s.hour_limit_value) {
          errors.push(`${s.name} would exceed weekly limit: ${totalWeekly}/${s.hour_limit_value}hrs`);
          continue;
        }
      } else {
        // Monthly: check against the month of THIS shift's date, not weekStartDate
        const shiftMonth = assignment.date.substring(0, 7); // 'YYYY-MM'
        const existingMonthly = (existing.monthly && existing.monthly[shiftMonth]) || 0;
        const monthAdded = addedHours[staffId].monthly[shiftMonth] || 0;
        const totalMonthly = existingMonthly + monthAdded + duration;
        if (totalMonthly > s.hour_limit_value) {
          errors.push(`${s.name} would exceed monthly limit: ${totalMonthly}/${s.hour_limit_value}hrs (month: ${shiftMonth})`);
          continue;
        }
      }
    }

    // ── CHECK 4: Trainee pairing ───────────────────────────
    if (constraintMap['trainee_must_pair_with_staff']?.is_enabled) {
      const assignedStaff = (assignment.staff_ids || []).map(id => staffMap[id]).filter(Boolean);
      const hasTrainee = assignedStaff.some(s => s.status === 'Trainee');
      const hasStaff = assignedStaff.some(s => s.status === 'Staff');
      if (hasTrainee && !hasStaff) {
        errors.push('Trainee assigned without a Staff member — trainee_must_pair_with_staff violated');
      }
    }

    // ── CHECK 5: Closing skill requirement ─────────────────
    if (constraintMap['closing_requires_skill']?.is_enabled && sp.label === 'Evening') {
      const minSkill = constraintMap['closing_requires_skill'].config?.min_skill_level || 3;
      const assignedStaff = (assignment.staff_ids || []).map(id => staffMap[id]).filter(Boolean);
      const hasCloser = assignedStaff.some(s => s.can_shop_closing && s.skill_shop_closing >= minSkill);
      if (!hasCloser) {
        errors.push(`Evening shift requires at least one closer with skill >= ${minSkill}`);
      }
    }

    // ── RESULT ─────────────────────────────────────────────
    if (errors.length > 0) {
      rejected.push({ ...assignment, reason: errors.join('; ') });
    } else {
      valid.push(assignment);

      // Accumulate hours for subsequent checks within this batch
      for (const staffId of (assignment.staff_ids || [])) {
        const duration = _calcDuration(sp.start_time, sp.end_time);
        addedHours[staffId].weekly += duration;
        const shiftMonth = assignment.date.substring(0, 7);
        addedHours[staffId].monthly[shiftMonth] = (addedHours[staffId].monthly[shiftMonth] || 0) + duration;

        // Track daily for opening+evening constraint
        if (!dailyAssignments[staffId]) dailyAssignments[staffId] = {};
        if (!dailyAssignments[staffId][assignment.date]) dailyAssignments[staffId][assignment.date] = [];
        dailyAssignments[staffId][assignment.date].push(sp.label);
      }
    }
  }

  // ── CHECK 6: Staffing count per shift (HARD — blocks publish) ─
  // Group valid assignments by (date, shift_period_id) and check against staffing rules
  const shiftGroups = {};
  for (const a of valid) {
    const key = `${a.date}|${a.shift_period_id}`;
    if (!shiftGroups[key]) shiftGroups[key] = { ...a, totalStaff: 0 };
    shiftGroups[key].totalStaff += (a.staff_ids || []).length;
  }
  let blockPublish = false;

  // ── CHECK 6a: Build FULL required shift matrix for the week ──
  // Catches shifts the AI omitted entirely (not just understaffed ones)
  const allDates = [];
  const wsDate = new Date(weekStartDate + 'T00:00:00Z');
  const weDate = new Date(weekEndDate + 'T00:00:00Z');
  for (let d = new Date(wsDate); d <= weDate; d.setUTCDate(d.getUTCDate() + 1)) {
    allDates.push(d.toISOString().substring(0, 10));
  }

  for (const dateStr of allDates) {
    const isoDow = _isoDayOfWeek(dateStr);
    const utcDay = new Date(dateStr + 'T00:00:00Z').getUTCDay();
    const baseDayType = (utcDay === 0 || utcDay === 6) ? 'weekend' : 'weekday';

    // Check for special day elevation — same type gate as ai.js
    const importantDate = (importantDates || []).find(id =>
      id.date === dateStr && id.affects_staffing && !id.shop_closed &&
      (id.type === 'busy_event' || id.type === 'holiday')
    );
    const effectiveDayType = importantDate ? 'special' : baseDayType;

    // Skip closed days (important_dates)
    const closedDate = (importantDates || []).find(id =>
      id.date === dateStr && id.shop_closed
    );
    if (closedDate) continue;

    // Skip days shop is regularly closed (shop_operating_hours)
    const opHours = (operatingHours || []).find(oh => oh.day_of_week === isoDow);
    if (opHours && opHours.is_closed) continue;

    // Find all shift periods for this day_type
    const periodsForDay = shiftPeriods.filter(sp => sp.day_type === effectiveDayType);

    for (const sp of periodsForDay) {
      const key = `${dateStr}|${sp.id}`;
      const rule = staffingRules.find(r =>
        r.shift_period_id === sp.id && r.day_type === effectiveDayType
      );
      if (!rule) continue;

      const group = shiftGroups[key];
      const assigned = group ? group.totalStaff : 0;

      if (assigned < rule.staff_count) {
        blockPublish = true;
        if (assigned === 0) {
          warnings.push({
            date: dateStr,
            shift_period_label: sp.label,
            type: 'missing_shift',
            severity: 'critical',
            detail: `No assignments for ${sp.label} on ${dateStr} (${effectiveDayType}) — need ${rule.staff_count} staff — BLOCKS PUBLISH`
          });
        } else {
          warnings.push({
            date: dateStr,
            shift_period_label: sp.label,
            type: 'understaffed',
            severity: 'critical',
            detail: `Only ${assigned}/${rule.staff_count} staff assigned — BLOCKS PUBLISH`
          });
        }
      }
    }
  }

  // ── Soft check: Opening + Evening same day ───────────────
  if (constraintMap['no_opening_and_evening_same_day']?.is_enabled) {
    for (const [staffId, days] of Object.entries(dailyAssignments)) {
      for (const [date, labels] of Object.entries(days)) {
        if (labels.includes('Opening') && labels.includes('Evening')) {
          warnings.push({
            date,
            staff_name: staffMap[staffId]?.name,
            type: 'long_gap',
            severity: 'medium',
            detail: `${staffMap[staffId]?.name} has both Opening and Evening on ${date}`
          });
        }
      }
    }
  }

  return { valid, rejected, warnings, blockPublish };
}

// ── Utility: ISO day of week (0=Mon, 6=Sun) ────────────────
// Avoids JS getDay() ambiguity (0=Sun) and timezone issues
function _isoDayOfWeek(dateStr) {
  // dateStr is 'YYYY-MM-DD', parse as UTC to avoid timezone shift
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (date.getUTCDay() + 6) % 7; // Convert: Sun=0 → 6, Mon=1 → 0, etc.
}

// ── Utility: Duration between two TIME strings ─────────────
// Handles overnight shifts (e.g., 22:00 → 02:00 = 4 hours)
function _calcDuration(startTime, endTime) {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let duration = (eh + em / 60) - (sh + sm / 60);
  if (duration <= 0) duration += 24; // overnight shift
  return duration;
}

module.exports = { validateAssignments };
```

---

## Seed Data: Development SQL (COMPLETE)

```sql
-- ============================================================
-- seed_data.sql
-- Sober Boba Fisketorvet — Development Test Data
-- Run AFTER all migrations are applied
-- ============================================================

-- ── 1. Manager User ──────────────────────────────────────────
-- Password: "SoberBoba2026!" — hash below is a PLACEHOLDER
-- Generate real hash: node -e "require('bcrypt').hash('SoberBoba2026!', 12).then(console.log)"
INSERT INTO users (id, email, password_hash, role, name) VALUES
  ('a0000000-0000-0000-0000-000000000001',
   'ray@soberboba.com',
   '$2b$12$PLACEHOLDER_GENERATE_REAL_HASH_AT_RUNTIME',
   'manager',
   'Rita');

-- ── 2. Shop ──────────────────────────────────────────────────
INSERT INTO shops (id, name, timezone, week_start, owner_id) VALUES
  ('b0000000-0000-0000-0000-000000000001',
   'Sober Boba Fisketorvet',
   'Europe/Copenhagen',
   'monday',
   'a0000000-0000-0000-0000-000000000001');

-- ── 2b. Shop Operating Hours ────────────────────────────────
-- day_of_week: 0=Monday, 6=Sunday
INSERT INTO shop_operating_hours (shop_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('b0000000-0000-0000-0000-000000000001', 0, '10:00', '21:00', FALSE),  -- Monday
  ('b0000000-0000-0000-0000-000000000001', 1, '10:00', '21:00', FALSE),  -- Tuesday
  ('b0000000-0000-0000-0000-000000000001', 2, '10:00', '21:00', FALSE),  -- Wednesday
  ('b0000000-0000-0000-0000-000000000001', 3, '10:00', '21:00', FALSE),  -- Thursday
  ('b0000000-0000-0000-0000-000000000001', 4, '10:00', '21:00', FALSE),  -- Friday
  ('b0000000-0000-0000-0000-000000000001', 5, '10:00', '21:00', FALSE),  -- Saturday
  ('b0000000-0000-0000-0000-000000000001', 6, '10:00', '21:00', FALSE);  -- Sunday

-- ── 3. Shift Periods ─────────────────────────────────────────
INSERT INTO shift_periods (id, shop_id, label, start_time, end_time, day_type) VALUES
  -- Weekday shifts
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Opening',  '10:00', '11:00', 'weekday'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Morning',  '11:00', '16:00', 'weekday'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Evening',  '16:00', '21:00', 'weekday'),
  -- Weekend shifts
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'Opening',  '10:00', '11:00', 'weekend'),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'Morning',  '11:00', '16:00', 'weekend'),
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'Evening',  '16:00', '21:00', 'weekend'),
  -- Special day shifts (same times, different staffing rules)
  ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', 'Opening',  '10:00', '11:00', 'special'),
  ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', 'Morning',  '11:00', '16:00', 'special'),
  ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000001', 'Evening',  '16:00', '21:00', 'special');

-- ── 4. Staffing Rules (headcount per shift per day_type) ─────
INSERT INTO staffing_rules (shop_id, day_type, shift_period_id, staff_count) VALUES
  -- Weekday: 1 per shift
  ('b0000000-0000-0000-0000-000000000001', 'weekday', 'c0000000-0000-0000-0000-000000000001', 1),
  ('b0000000-0000-0000-0000-000000000001', 'weekday', 'c0000000-0000-0000-0000-000000000002', 1),
  ('b0000000-0000-0000-0000-000000000001', 'weekday', 'c0000000-0000-0000-0000-000000000003', 1),
  -- Weekend: 1-2 per shift (busier)
  ('b0000000-0000-0000-0000-000000000001', 'weekend', 'c0000000-0000-0000-0000-000000000004', 1),
  ('b0000000-0000-0000-0000-000000000001', 'weekend', 'c0000000-0000-0000-0000-000000000005', 2),
  ('b0000000-0000-0000-0000-000000000001', 'weekend', 'c0000000-0000-0000-0000-000000000006', 2),
  -- Special: 2-3 per shift
  ('b0000000-0000-0000-0000-000000000001', 'special', 'c0000000-0000-0000-0000-000000000007', 2),
  ('b0000000-0000-0000-0000-000000000001', 'special', 'c0000000-0000-0000-0000-000000000008', 3),
  ('b0000000-0000-0000-0000-000000000001', 'special', 'c0000000-0000-0000-0000-000000000009', 3);

-- ── 5. Staff Users (for portal login) ────────────────────────
-- Password for all staff: "Staff2026!" — hashes are PLACEHOLDERS
-- Generate real hashes: node -e "require('bcrypt').hash('Staff2026!', 12).then(console.log)"
INSERT INTO users (id, email, password_hash, role, name) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'tom@soberboba.com',   '$2b$12$PLACEHOLDER', 'staff', 'Tom'),
  ('a0000000-0000-0000-0000-000000000003', 'emma@soberboba.com',  '$2b$12$PLACEHOLDER', 'staff', 'Emma'),
  ('a0000000-0000-0000-0000-000000000004', 'sarah@soberboba.com', '$2b$12$PLACEHOLDER', 'staff', 'Sarah'),
  ('a0000000-0000-0000-0000-000000000005', 'alex@soberboba.com',  '$2b$12$PLACEHOLDER', 'staff', 'Alex'),
  ('a0000000-0000-0000-0000-000000000006', 'lisa@soberboba.com',  '$2b$12$PLACEHOLDER', 'staff', 'Lisa'),
  ('a0000000-0000-0000-0000-000000000007', 'maria@soberboba.com', '$2b$12$PLACEHOLDER', 'staff', 'Maria');

-- ── 6. Staff Records ─────────────────────────────────────────
INSERT INTO staff (id, shop_id, user_id, name, email, gender, status, color,
                   can_shop_opening, can_bubble_tea_making, can_shop_closing,
                   skill_shop_opening, skill_bubble_tea_making, skill_shop_closing,
                   hour_limit_type, hour_limit_value, hour_limit_reason) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002',
   'Tom', 'tom@soberboba.com', 'Male', 'Staff', '#3b82f6',
   TRUE, TRUE, TRUE, 5, 5, 4,
   'monthly', 160, 'Full-time contract'),

  ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003',
   'Emma', 'emma@soberboba.com', 'Female', 'Staff', '#8b5cf6',
   TRUE, TRUE, TRUE, 4, 4, 4,
   'monthly', 160, 'Full-time contract'),

  ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004',
   'Sarah', 'sarah@soberboba.com', 'Female', 'Trainee', '#10b981',
   TRUE, TRUE, FALSE, 3, 3, NULL,
   'weekly', 20, 'Student SU rules'),

  ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005',
   'Alex', 'alex@soberboba.com', 'Male', 'Trainee', '#f59e0b',
   FALSE, TRUE, FALSE, NULL, 2, NULL,
   'weekly', 20, 'Student SU rules'),

  ('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006',
   'Lisa', 'lisa@soberboba.com', 'Female', 'Staff', '#ef4444',
   TRUE, TRUE, TRUE, 4, 4, 3,
   'monthly', 160, 'Full-time contract'),

  ('d0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000007',
   'Maria', 'maria@soberboba.com', 'Female', 'Staff', '#eab308',
   FALSE, TRUE, FALSE, NULL, 3, NULL,
   'weekly', 20, 'Student SU rules');

-- ── 7. Staff Availability ────────────────────────────────────
-- day_of_week: 0=Monday, 6=Sunday (ISO convention, NOT JS getDay())

-- Tom: Mon–Sun 8:00–23:00
INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time) VALUES
  ('d0000000-0000-0000-0000-000000000001', 0, '08:00', '23:00'),
  ('d0000000-0000-0000-0000-000000000001', 1, '08:00', '23:00'),
  ('d0000000-0000-0000-0000-000000000001', 2, '08:00', '23:00'),
  ('d0000000-0000-0000-0000-000000000001', 3, '08:00', '23:00'),
  ('d0000000-0000-0000-0000-000000000001', 4, '08:00', '23:00'),
  ('d0000000-0000-0000-0000-000000000001', 5, '08:00', '23:00'),
  ('d0000000-0000-0000-0000-000000000001', 6, '08:00', '23:00');

-- Emma: Mon–Fri 9:00–18:00
INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time) VALUES
  ('d0000000-0000-0000-0000-000000000002', 0, '09:00', '18:00'),
  ('d0000000-0000-0000-0000-000000000002', 1, '09:00', '18:00'),
  ('d0000000-0000-0000-0000-000000000002', 2, '09:00', '18:00'),
  ('d0000000-0000-0000-0000-000000000002', 3, '09:00', '18:00'),
  ('d0000000-0000-0000-0000-000000000002', 4, '09:00', '18:00');

-- Sarah: Mon/Wed/Fri 11:00–21:00
INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time) VALUES
  ('d0000000-0000-0000-0000-000000000003', 0, '11:00', '21:00'),
  ('d0000000-0000-0000-0000-000000000003', 2, '11:00', '21:00'),
  ('d0000000-0000-0000-0000-000000000003', 4, '11:00', '21:00');

-- Alex: Tue/Thu/Sat 14:00–22:00
INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time) VALUES
  ('d0000000-0000-0000-0000-000000000004', 1, '14:00', '22:00'),
  ('d0000000-0000-0000-0000-000000000004', 3, '14:00', '22:00'),
  ('d0000000-0000-0000-0000-000000000004', 5, '14:00', '22:00');

-- Lisa: Tue–Sun 10:00–22:00
INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time) VALUES
  ('d0000000-0000-0000-0000-000000000005', 1, '10:00', '22:00'),
  ('d0000000-0000-0000-0000-000000000005', 2, '10:00', '22:00'),
  ('d0000000-0000-0000-0000-000000000005', 3, '10:00', '22:00'),
  ('d0000000-0000-0000-0000-000000000005', 4, '10:00', '22:00'),
  ('d0000000-0000-0000-0000-000000000005', 5, '10:00', '22:00'),
  ('d0000000-0000-0000-0000-000000000005', 6, '10:00', '22:00');

-- Maria: Sat/Sun 10:00–22:00
INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time) VALUES
  ('d0000000-0000-0000-0000-000000000007', 5, '10:00', '22:00'),
  ('d0000000-0000-0000-0000-000000000007', 6, '10:00', '22:00');

-- ── 8. Important Dates (sample) ──────────────────────────────
INSERT INTO important_dates (shop_id, name, date, type, shop_closed, affects_staffing, notes, source) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Store Anniversary', '2026-03-15', 'busy_event', FALSE, TRUE, 'Promo day, expect 2x traffic', 'manual'),
  ('b0000000-0000-0000-0000-000000000001', 'Grundlovsdag', '2026-06-05', 'holiday', FALSE, TRUE, 'Danish Constitution Day — shop open, reduced hours', 'nager.date'),
  ('b0000000-0000-0000-0000-000000000001', 'Christmas Eve', '2026-12-24', 'holiday', TRUE, FALSE, 'Shop closed', 'nager.date'),
  ('b0000000-0000-0000-0000-000000000001', 'Cinema Premiere Night', '2026-02-20', 'busy_event', FALSE, TRUE, 'DGI Byen major release, expect surge after 19:00', 'manual');

-- ── 9. Default Scheduling Constraints ────────────────────────
INSERT INTO scheduling_constraints (shop_id, constraint_type, is_enabled, config) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'trainee_must_pair_with_staff', TRUE,
   '{"description": "Trainees must always be scheduled alongside at least one Staff member"}'),
  ('b0000000-0000-0000-0000-000000000001', 'closing_requires_skill', TRUE,
   '{"min_skill_level": 3, "description": "Closing shift requires at least one closer with skill >= 3"}'),
  ('b0000000-0000-0000-0000-000000000001', 'no_opening_and_evening_same_day', FALSE,
   '{"description": "Avoid scheduling same person for Opening + Evening (long gap). Soft constraint."}');
```

---

## Frontend Screens, Interactions

- **AI Generate Button:** disables on click, shows animated progress bar (est. 5–10 sec). On success: schedule grid updated, toast notification with confidence score, all warnings rendered. On error: modal with retry/wait/manual fallback options.
- **Drag-and-Drop:** Staff cards color-coded in sidebar. Drop on shift cell validates capabilities, hour limits, compliance. Hard constraint violations show error toast and block drop. Soft constraint warning modal, manager can override.
- **Publish Modal:** Summarizes staff assignments, hours, limit types. All warnings listed. "Publish Anyway" if warnings. Confirms schedule is locked, staff notified via portal.

---

## CORS, Claude Model Env, Color Assignment

```javascript
// CORS Configuration
const cors = require('cors');
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Color Palette and Assignment
const STAFF_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981',
  '#f59e0b', '#ef4444', '#eab308',
  '#8b4513', '#6b7280'
];
function assignStaffColor(shopId) {
  const existingStaff = getStaffByShop(shopId);
  const usedColors = existingStaff.map(s => s.color);
  const availableColor = STAFF_COLORS.find(c => !usedColors.includes(c));
  return availableColor || STAFF_COLORS[existingStaff.length % STAFF_COLORS.length];
}
```

---

## Database Migration Sequence

```
migrations/
├── 001_create_users.sql
├── 002_create_shops.sql
├── 003_create_shop_operating_hours.sql
├── 004_create_staff.sql
├── 005_create_shift_periods.sql
├── 006_create_staffing_rules.sql
├── 007_create_staff_availability.sql
├── 008_create_important_dates.sql
├── 009_create_schedules.sql
├── 010_create_shifts.sql
├── 011_create_ai_patterns.sql
├── 012_create_scheduling_constraints.sql
├── 013_create_schedule_edits.sql
├── 014_create_event_staffing_patterns.sql
└── 015_add_indexes.sql
```

> **Index strategy:** All `CREATE INDEX` statements are inline with their table DDLs. Migration `015_add_indexes.sql` should use `CREATE INDEX IF NOT EXISTS` for any additional composite or covering indexes not already created inline, to avoid duplicate-index failures.

---

## END OF DOCUMENT

**v10 fixes (fourth Codex review):**
1. ✅ **P0: Full required shift matrix** — Validator now builds all `date × shift_period` combos for the week, detects shifts AI omitted entirely (`missing_shift`), blocks publish
2. ✅ **P1: Accept staff_ids OR staff_names** — Schema validation no longer rejects valid AI output with IDs-only
3. ✅ **P1: Dedupe staff IDs in merge** — Normalization uses `Set` to prevent double-counting hours/headcount
4. ✅ **P1: Special day type gating** — `affects_staffing` defaults to `FALSE` + requires `type IN ('busy_event', 'holiday')` for special elevation
5. ✅ **P1: Shifts uniqueness guard** — `UNIQUE(schedule_id, shift_period_id, date, staff_id)` prevents duplicate inserts

**Cumulative from v7–v9:**
- Configurable per-staff hour limits (no hardcoded law) with per-month-of-shift-date checking
- All 14 table DDLs present with indexes
- Server-side `validateAssignments()` with all 6 hard constraints + `blockPublish` flag
- `shop_operating_hours` table
- AI prompt includes staff IDs; output prefers `staff_ids[]` with `staff_names[]` fallback
- Assignment normalization by `(date, shift_period_id)` before validation
- Timezone-safe day-of-week everywhere
- `schedule_edits` as audit trail (immutable versioning deferred)
- Single availability window per day (split windows deferred with note)
