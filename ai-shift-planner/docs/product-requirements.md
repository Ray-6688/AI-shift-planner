# Product Requirements

## Calendar-Driven Staffing (Fisketorvet, Copenhagen)

### Objective
Improve shift planning quality by integrating high-relevance demand signals for a shop located in Fisketorvet, and use those signals directly in shift generation.

### In Scope (3 Required Calendar Sources)
1. Fisketorvet campaigns/promotions calendar
2. Vue Fisketorvet movie calendar (showtimes and major premieres)
3. Copenhagen school holiday calendar (Københavns Kommune)

### Scope Rules
1. Transport/disruption calendar is out of scope.
2. Only Copenhagen municipality school holiday data is ingested from source #3.
3. National general festival feeds are out of scope for this phase.

### Out of Scope
1. Low-relevance national event feeds without local impact
2. Full transport timetables or transport disruption integration

### Functional Requirements

#### FR-1: Calendar Source Management (Settings)
1. The Settings page must provide one row per source with:
   - source name
   - sync status (`Connected`, `Error`, `Never Synced`)
   - last successful sync timestamp
   - enable/disable toggle
   - manual `Sync now` action
2. Disabling a source must stop new ingestion from that source without deleting existing normalized events.
3. Re-enabling a source must allow sync to resume from the next scheduled/manual run.

#### FR-2: Event Visibility in Schedule Calendar
1. The schedule week view must show event markers on relevant dates.
2. Only `medium` and `high` impact events are shown by default on the schedule calendar.
3. Marker color coding is required:
   - `medium` impact: orange/amber marker
   - `high` impact: red marker
4. Clicking a marker must open event details including:
   - title
   - source
   - date/time window
   - impact label (`medium` or `high`)
   - staffing impact reason

#### FR-3: Staffing Impact Application
1. Events must be normalized into internal event records and linked to the week planner.
2. Scheduler must use normalized event impact to adjust staffing demand:
   - `high` impact events increase required staffing for configured periods
   - `medium` impact events apply a smaller staffing increase
3. Shift generation must consider enabled sources only.
4. Store manager can override event impact manually per date.

#### FR-4: Manual Event Control
1. Manager can add/edit/remove manual events from the app.
2. Manual events must appear in the same weekly calendar markers as synced events.
3. Manual override takes precedence over auto-inferred impact for the same date/source scope.

#### FR-5: Sync Reliability
1. Ingestion must be idempotent (no duplicate event rows for the same source event).
2. Sync failures must be visible in Settings with last error summary.
3. Planner must continue functioning if one or more sources fail.

### Data Requirements
1. All external events must be normalized into a common internal shape (title, source, start/end, type, impact, confidence, external_id).
2. Existing `important_dates` can be used/extended as the normalized event store.
3. Source-level sync preferences must be persisted per shop.

### Acceptance Criteria
1. Manager can toggle each of the 3 sources on/off in Settings.
2. When enabled, synced events appear on weekly schedule dates.
3. Only medium/high events are shown in the calendar markers.
4. Medium events are visually distinct from high events by dedicated marker colors.
5. `Generate AI Schedule` incorporates enabled source impacts for that week.
6. Disabling a source stops future updates from that source.
7. If a source sync fails, planning still works and failure is visible in Settings.

### Priority
1. P0: Settings toggles + weekly calendar medium/high marker rendering + normalized ingestion
2. P1: Shift generation demand multipliers by impact level
3. P2: Advanced weighting and learned event staffing patterns
