begin;

-- staff
create index if not exists idx_staff_shop on public.staff(shop_id);
create index if not exists idx_staff_user on public.staff(user_id);
create index if not exists idx_staff_active on public.staff(is_active);

-- shops
create index if not exists idx_shops_owner_id on public.shops(owner_id);

-- shop operating hours
create index if not exists idx_shop_hours_shop on public.shop_operating_hours(shop_id);

-- important dates
create index if not exists idx_important_dates_shop on public.important_dates(shop_id);
create index if not exists idx_important_dates_date on public.important_dates(date);
create index if not exists idx_important_dates_type on public.important_dates(type);

-- shift periods
create index if not exists idx_shift_periods_shop on public.shift_periods(shop_id);
create index if not exists idx_shift_periods_day_type on public.shift_periods(day_type);

-- staff availability
create index if not exists idx_staff_availability_staff on public.staff_availability(staff_id);
create index if not exists idx_staff_availability_day on public.staff_availability(day_of_week);

-- schedules
create index if not exists idx_schedules_shop on public.schedules(shop_id);
create index if not exists idx_schedules_status on public.schedules(status);
create index if not exists idx_schedules_week on public.schedules(week_start_date);

-- shifts
create index if not exists idx_shifts_schedule on public.shifts(schedule_id);
create index if not exists idx_shifts_staff on public.shifts(staff_id);
create index if not exists idx_shifts_date on public.shifts(date);
create index if not exists idx_shifts_period on public.shifts(shift_period_id);
create index if not exists idx_shifts_staff_date on public.shifts(staff_id, date);
create unique index if not exists idx_shifts_unique_assignment on public.shifts(schedule_id, shift_period_id, date, staff_id);

commit;
