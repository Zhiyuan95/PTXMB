-- Add note column to entries table
alter table public.entries 
add column if not exists note text;
