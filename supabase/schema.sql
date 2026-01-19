-- Create a table for public profiles (optional, for future user details)
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  updated_at timestamp with time zone,
  email text,
  full_name text,
  avatar_url text,
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on public.profiles
  for update using ((select auth.uid()) = id);

-- Create Templates Table
create table public.templates (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  unit text not null, -- 'count', 'time', 'sessions', 'pages'
  daily_target integer,
  minimum_target integer,
  total_target integer,
  initial_total integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.templates enable row level security;

create policy "Users can view their own templates." on public.templates
  for select using ((select auth.uid()) = user_id);

create policy "Users can insert their own templates." on public.templates
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can update their own templates." on public.templates
  for update using ((select auth.uid()) = user_id);

create policy "Users can delete their own templates." on public.templates
  for delete using ((select auth.uid()) = user_id);

-- Create Entries Table
create table public.entries (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid not null references public.templates(id) on delete cascade,
  amount integer not null,
  unit text not null,
  entry_date date not null, -- 'YYYY-MM-DD'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.entries enable row level security;

create policy "Users can view their own entries." on public.entries
  for select using ((select auth.uid()) = user_id);

create policy "Users can insert their own entries." on public.entries
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can update their own entries." on public.entries
  for update using ((select auth.uid()) = user_id);

create policy "Users can delete their own entries." on public.entries
  for delete using ((select auth.uid()) = user_id);

-- Create Preferences Table (Global User Settings like 'dedicationText')
create table public.preferences (
  user_id uuid not null references auth.users(id) on delete cascade primary key,
  dedication_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.preferences enable row level security;

create policy "Users can view their own preferences." on public.preferences
  for select using ((select auth.uid()) = user_id);

create policy "Users can insert their own preferences." on public.preferences
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can update their own preferences." on public.preferences
  for update using ((select auth.uid()) = user_id);

-- Handle user creation trigger to automatically create a profile entry
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
