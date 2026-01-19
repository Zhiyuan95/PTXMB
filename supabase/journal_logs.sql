-- Create Journal Logs Table
create table public.journal_logs (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure only one log per day per user
  unique(user_id, log_date)
);

alter table public.journal_logs enable row level security;

create policy "Users can view their own journal logs." on public.journal_logs
  for select using ((select auth.uid()) = user_id);

create policy "Users can insert their own journal logs." on public.journal_logs
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can update their own journal logs." on public.journal_logs
  for update using ((select auth.uid()) = user_id);

create policy "Users can delete their own journal logs." on public.journal_logs
  for delete using ((select auth.uid()) = user_id);
