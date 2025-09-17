-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create messages table for AI Professor chat
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  course_id varchar,
  role varchar not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create courses table
create table if not exists public.courses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title varchar not null,
  description text,
  difficulty varchar check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  estimated_duration varchar,
  modules jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_progress table
create table if not exists public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  module_id varchar,
  lesson_id varchar,
  completed boolean default false,
  progress_percentage integer default 0,
  last_accessed timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create assessments table
create table if not exists public.assessments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  title varchar not null,
  questions jsonb default '[]'::jsonb,
  score integer,
  max_score integer,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.messages enable row level security;
alter table public.courses enable row level security;
alter table public.user_progress enable row level security;
alter table public.assessments enable row level security;

-- Create RLS policies
-- Messages policies
create policy "Users can view their own messages" on public.messages
  for select using (auth.uid() = user_id);

create policy "Users can insert their own messages" on public.messages
  for insert with check (auth.uid() = user_id);

-- Courses policies
create policy "Users can view their own courses" on public.courses
  for select using (auth.uid() = user_id);

create policy "Users can create their own courses" on public.courses
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own courses" on public.courses
  for update using (auth.uid() = user_id);

create policy "Users can delete their own courses" on public.courses
  for delete using (auth.uid() = user_id);

-- User progress policies
create policy "Users can view their own progress" on public.user_progress
  for select using (auth.uid() = user_id);

create policy "Users can insert their own progress" on public.user_progress
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own progress" on public.user_progress
  for update using (auth.uid() = user_id);

-- Assessments policies
create policy "Users can view their own assessments" on public.assessments
  for select using (auth.uid() = user_id);

create policy "Users can create their own assessments" on public.assessments
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own assessments" on public.assessments
  for update using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_messages_user_id on public.messages(user_id);
create index if not exists idx_messages_course_id on public.messages(course_id);
create index if not exists idx_courses_user_id on public.courses(user_id);
create index if not exists idx_user_progress_user_id on public.user_progress(user_id);
create index if not exists idx_user_progress_course_id on public.user_progress(course_id);
create index if not exists idx_assessments_user_id on public.assessments(user_id);
create index if not exists idx_assessments_course_id on public.assessments(course_id);