-- =============================================
-- DeepPulse - Supabase PostgreSQL Schema
-- =============================================

-- EXTENSIONS
create extension if not exists "uuid-ossp";

-- =============================================
-- 1. PROFILES (extends Supabase auth.users)
-- =============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  daily_focus_goal_minutes int default 300,       -- 5 hours default
  preferred_session_length int default 25,         -- minutes
  dark_mode boolean default true,
  webcam_mode boolean default false,
  notifications_enabled boolean default true,
  ambient_sound_enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- 2. FOCUS SESSIONS
-- =============================================
create table public.focus_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  category text check (category in ('Coding','Study','Reading','Writing','Research')) default 'Coding',
  planned_duration int not null,     -- minutes
  actual_duration int,               -- minutes (filled on end)
  start_time timestamptz,
  end_time timestamptz,
  pause_count int default 0,
  distraction_count int default 0,
  idle_seconds int default 0,
  focus_score numeric(5,2),          -- 0.00 - 100.00
  score_label text check (score_label in ('Excellent','Good','Fair','Needs Work')),
  completed boolean default false,
  status text check (status in ('not_started','active','paused','completed','abandoned')) default 'not_started',
  created_at timestamptz default now()
);
create index idx_sessions_user_id on focus_sessions(user_id);
create index idx_sessions_start_time on focus_sessions(start_time);
create index idx_sessions_status on focus_sessions(status);
alter table public.focus_sessions enable row level security;
create policy "Users can manage own sessions" on focus_sessions for all using (auth.uid() = user_id);

-- =============================================
-- 3. SESSION EVENTS (granular behavior log)
-- =============================================
create table public.session_events (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references focus_sessions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  event_type text check (event_type in ('tab_hidden','window_blur','idle','pause','resume','nudge','distraction')) not null,
  event_value text,                  -- optional metadata (e.g., idle duration in seconds)
  created_at timestamptz default now()
);
create index idx_events_session_id on session_events(session_id);
create index idx_events_user_id on session_events(user_id);
alter table public.session_events enable row level security;
create policy "Users can manage own events" on session_events for all using (auth.uid() = user_id);

-- =============================================
-- 4. MOOD LOGS
-- =============================================
create table public.mood_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  session_id uuid references focus_sessions(id) on delete set null,
  mood_before int check (mood_before between 1 and 5),
  mood_after int check (mood_after between 1 and 5),
  energy_level int check (energy_level between 1 and 5),
  notes text,
  created_at timestamptz default now()
);
create index idx_mood_user_id on mood_logs(user_id);
alter table public.mood_logs enable row level security;
create policy "Users can manage own mood logs" on mood_logs for all using (auth.uid() = user_id);

-- =============================================
-- 5. AI INSIGHTS
-- =============================================
create table public.ai_insights (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  insight_type text check (insight_type in ('pattern','recommendation','achievement','warning')) not null,
  title text not null,
  description text not null,
  action_text text,                  -- CTA shown to user
  is_read boolean default false,
  created_at timestamptz default now()
);
create index idx_insights_user_id on ai_insights(user_id);
alter table public.ai_insights enable row level security;
create policy "Users can manage own insights" on ai_insights for all using (auth.uid() = user_id);

-- =============================================
-- 6. ACHIEVEMENTS
-- =============================================
create table public.achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  badge_key text not null,           -- e.g. 'early_bird', 'on_fire', 'flow_state'
  badge_name text not null,
  badge_description text,
  badge_emoji text,
  unlocked_at timestamptz default now(),
  unique(user_id, badge_key)
);
create index idx_achievements_user_id on achievements(user_id);
alter table public.achievements enable row level security;
create policy "Users can view own achievements" on achievements for select using (auth.uid() = user_id);

-- =============================================
-- FOCUS SCORE CALCULATION FUNCTION
-- =============================================
create or replace function calculate_focus_score(
  p_planned_duration int,
  p_actual_duration int,
  p_distraction_count int,
  p_pause_count int,
  p_idle_seconds int
) returns numeric language plpgsql as $$
declare
  base_score numeric := 100;
  completion_pct numeric;
  distraction_penalty numeric;
  pause_penalty numeric;
  idle_penalty numeric;
begin
  completion_pct := least(p_actual_duration::numeric / p_planned_duration, 1.0);
  base_score := base_score * (0.5 + 0.5 * completion_pct);
  distraction_penalty := least(p_distraction_count * 4, 30);
  pause_penalty := least(p_pause_count * 3, 15);
  idle_penalty := least((p_idle_seconds / 60.0) * 2, 20);
  return greatest(round(base_score - distraction_penalty - pause_penalty - idle_penalty, 2), 0);
end;
$$;

-- =============================================
-- SEED DATA (demo user — replace user_id)
-- =============================================
-- Run this after creating a demo user in Supabase Auth dashboard

do $$
declare demo_uid uuid := 'YOUR-DEMO-USER-UUID-HERE';
declare s1 uuid; declare s2 uuid; declare s3 uuid; declare s4 uuid;
begin

-- Seed focus sessions
insert into focus_sessions (id, user_id, title, category, planned_duration, actual_duration, start_time, end_time, pause_count, distraction_count, idle_seconds, focus_score, score_label, completed, status)
values
  (uuid_generate_v4(), demo_uid, 'Landing Page Design', 'Coding', 50, 50, now()-interval'3 hours', now()-interval'2 hours 10 min', 0, 2, 45, 91.00, 'Excellent', true, 'completed'),
  (uuid_generate_v4(), demo_uid, 'Research: Focus Techniques', 'Research', 25, 25, now()-interval'5 hours', now()-interval'4 hours 35 min', 1, 4, 120, 78.00, 'Good', true, 'completed'),
  (uuid_generate_v4(), demo_uid, 'System Architecture Doc', 'Writing', 90, 87, now()-interval'1 day', now()-interval'23 hours', 2, 6, 200, 72.00, 'Good', true, 'completed'),
  (uuid_generate_v4(), demo_uid, 'Chapter 4 Reading', 'Study', 25, 18, now()-interval'1 day 3 hours', now()-interval'1 day 2 hours 42 min', 3, 9, 310, 54.00, 'Fair', false, 'abandoned');

-- Seed mood logs
insert into mood_logs (user_id, mood_before, mood_after, energy_level, notes)
values
  (demo_uid, 4, 5, 4, 'Great session, felt in flow'),
  (demo_uid, 3, 4, 3, 'Started slow but got into it'),
  (demo_uid, 2, 3, 2, 'Tired, too many distractions');

-- Seed AI insights
insert into ai_insights (user_id, insight_type, title, description, action_text)
values
  (demo_uid, 'pattern', 'You lose focus after ~23 minutes', 'Across your last 30 sessions, attention quality drops sharply around the 23-minute mark.', 'Try 25-minute sessions'),
  (demo_uid, 'pattern', 'Your best focus window is 8–10 PM', 'Evening sessions consistently score 15–20 points higher than morning sessions.', 'Schedule deep work at 8 PM'),
  (demo_uid, 'recommendation', 'Coding is your strongest category', 'Your average focus score for Coding sessions is 88 — 14 points above your overall average.', 'Use coding as anchor blocks'),
  (demo_uid, 'warning', 'Tab switching is your #1 distraction', '67% of your distraction events are tab-switch detections.', 'Close unrelated tabs before sessions');

-- Seed achievements
insert into achievements (user_id, badge_key, badge_name, badge_description, badge_emoji)
values
  (demo_uid, 'early_bird', 'Early Bird', 'Completed 5 morning sessions', '🌅'),
  (demo_uid, 'on_fire', 'On Fire', 'Maintained a 7-day streak', '🔥'),
  (demo_uid, 'flow_state', 'Flow State', 'Scored 95+ on a session', '⚡'),
  (demo_uid, 'diamond_focus', 'Diamond Focus', 'Logged 10+ hours in one week', '💎');

end $$;
